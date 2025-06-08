import torch
import logging
import signal
import threading
from utils.config import Config

logger = logging.getLogger(__name__)

class TimeoutException(Exception):
    pass

class ModelInference:
    def __init__(self, model_loader):
        self.model = model_loader.get_model()
        self.tokenizer = model_loader.get_tokenizer()
        self.device = next(self.model.parameters()).device
        self.generation_timeout = 300  # 5 minutes timeout
    
    def _timeout_handler(self, signum, frame):
        raise TimeoutException("Model generation timed out")
    
    def _validate_response(self, response, user_message):
        """Validate and sanitize model response"""
        if not response:
            return "I apologize, but I couldn't generate a proper response. Could you please rephrase your question?"
        
        # Remove excessive whitespace
        response = response.strip()
        
        # Check minimum length
        if len(response) < 10:
            return f"I can help you with DevOps questions about Docker, Kubernetes, CI/CD, and infrastructure. Could you please be more specific about '{user_message}'?"
        
        # Check for incomplete sentences (basic validation)
        if not response.endswith(('.', '!', '?', ':')):
            response += "."
        
        return response
    
    def generate_response(self, messages):
        """Generate response using proper Llama-3.2-Instruct with commercial-grade error handling"""
        try:
            # Extract user message
            user_message = ""
            for message in messages:
                if message.get('role') == 'user':
                    user_message = message.get('content', '').strip()
                    break
            
            if not user_message:
                return "Hello! I'm a DevOps AI assistant. I can help with Docker, Kubernetes, CI/CD, infrastructure, and cloud technologies. What would you like to know?"
            
            # Validate input length
            if len(user_message) > 1000:
                return "Your message is quite long. Please keep questions under 1000 characters for better response quality."
            
            # Create proper chat format for Llama-3.2-Instruct
            chat_messages = [
                {
                    "role": "system", 
                    "content": "You are a helpful DevOps AI assistant. Provide clear, concise, and practical answers about Docker, Kubernetes, CI/CD, infrastructure automation, cloud technologies, and related DevOps tools. Keep responses professional and focused."
                },
                {
                    "role": "user", 
                    "content": user_message
                }
            ]
            
            # Use tokenizer's chat template
            prompt = self.tokenizer.apply_chat_template(
                chat_messages,
                tokenize=False,
                add_generation_prompt=True
            )
            
            logger.info(f"User message: {user_message[:100]}...")
            logger.info(f"Formatted prompt length: {len(prompt)} chars")
            
            # Tokenize with proper settings
            inputs = self.tokenizer(
                prompt,
                return_tensors="pt",
                truncation=True,
                max_length=1024,             # Reduced from 2048
                padding=True,
                return_attention_mask=True
            )

            input_ids = inputs['input_ids'].to(self.device)
            attention_mask = inputs['attention_mask'].to(self.device)
            
            # Set up timeout protection
            def generate_with_timeout():
                with torch.no_grad():
                    return self.model.generate(
                        input_ids,
                        attention_mask=attention_mask,
                        max_new_tokens=30,       
                        do_sample=False,
                        temperature=None,        # Explicitly disable
                        top_p=None,             # Explicitly disable
                        pad_token_id=self.tokenizer.eos_token_id,
                        eos_token_id=self.tokenizer.eos_token_id,
                    )
            
            # Execute with timeout
            result = [None]
            exception = [None]
            
            def target():
                try:
                    result[0] = generate_with_timeout()
                except Exception as e:
                    exception[0] = e
            
            thread = threading.Thread(target=target)
            thread.daemon = True
            thread.start()
            thread.join(timeout=self.generation_timeout)
            
            if thread.is_alive():
                logger.error("Model generation timed out")
                return "I'm taking longer than expected to respond. Please try a simpler question or try again in a moment."
            
            if exception[0]:
                raise exception[0]
            
            if result[0] is None:
                logger.error("Model generation returned None")
                return "I encountered an issue generating a response. Please try again."
            
            outputs = result[0]
            
            # Decode response
            raw_response = self.tokenizer.decode(
                outputs[0][inputs['input_ids'].shape[1]:],
                skip_special_tokens=True
            ).strip()
            
            logger.info(f"Raw model response: {raw_response[:200]}...")
            
            # Validate and clean response
            validated_response = self._validate_response(raw_response, user_message)
            
            # Final length check
            if len(validated_response) > 1500:
                validated_response = validated_response[:1500] + "..."
            
            logger.info(f"Final response length: {len(validated_response)} chars")
            
            return validated_response
            
        except torch.cuda.OutOfMemoryError as e:
            logger.error(f"GPU memory error: {e}")
            return "I'm currently experiencing high demand. Please try again in a moment."
            
        except TimeoutException as e:
            logger.error(f"Generation timeout: {e}")
            return "Your request is taking longer than expected. Please try a simpler question."
            
        except Exception as e:
            logger.error(f"Model inference error: {e}", exc_info=True)
            error_id = str(hash(str(e)))[-6:]  # Short error reference
            return f"I'm experiencing technical difficulties right now. Please try again in a moment. (Ref: {error_id})" 