import torch
import logging
from utils.config import Config

logger = logging.getLogger(__name__)

class ModelInference:
    def __init__(self, model_loader):
        self.model = model_loader.get_model()
        self.tokenizer = model_loader.get_tokenizer()
        self.device = next(self.model.parameters()).device
        
        # DevOps-focused system prompt that encourages markdown output
        self.system_prompt = """You are a helpful DevOps AI Assistant. Always format your responses using markdown for better readability:

- Use **bold** for important terms and tools
- Use `inline code` for commands, file names, and configuration values  
- Use ```language code blocks for multi-line code, scripts, and configuration files
- Use ## headers to organize sections
- Use numbered lists for step-by-step instructions
- Use bullet points for options or features
- Use tables for comparisons when helpful
- Use > blockquotes for tips and warnings

Provide practical, actionable DevOps advice with proper markdown formatting."""
    
    def format_messages(self, messages):
        """Format messages using Llama's chat template with system prompt"""
        # Start with system message
        conversation = [
            {"role": "system", "content": self.system_prompt}
        ]
        
        # Add conversation history
        for message in messages:
            role = message.get('role', 'user')
            content = message.get('content', '')
            conversation.append({"role": role, "content": content})
        
        # Use tokenizer's chat template if available
        if hasattr(self.tokenizer, 'apply_chat_template'):
            try:
                formatted_text = self.tokenizer.apply_chat_template(
                    conversation,
                    tokenize=False,
                    add_generation_prompt=True
                )
                return formatted_text
            except Exception as e:
                logger.warning(f"Chat template failed, using fallback: {e}")
        
        # Fallback formatting for older tokenizers
        formatted_text = f"System: {self.system_prompt}\n\n"
        for message in conversation[1:]:  # Skip system message as it's already added
            role = message.get('role', 'user')
            content = message.get('content', '')
            
            if role == 'user':
                formatted_text += f"User: {content}\n"
            elif role == 'assistant':
                formatted_text += f"Assistant: {content}\n"
        
        formatted_text += "Assistant: "
        return formatted_text
    
    def generate_response(self, messages):
        """Generate response from the model"""
        try:
            # Format the conversation with system prompt
            prompt = self.format_messages(messages)
            
            # Tokenize input
            inputs = self.tokenizer.encode(
                prompt,
                return_tensors="pt",
                truncation=True,
                max_length=Config.MAX_INPUT_LENGTH
            ).to(self.device)
            
            # Generate response with optimized parameters for better output
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs,
                    max_new_tokens=Config.MAX_NEW_TOKENS,
                    temperature=Config.TEMPERATURE,
                    do_sample=True,
                    top_p=0.9,  # Add nucleus sampling for better quality
                    pad_token_id=self.tokenizer.eos_token_id,
                    attention_mask=torch.ones_like(inputs),
                    repetition_penalty=1.1  # Reduce repetition
                )
            
            # Decode response
            response = self.tokenizer.decode(
                outputs[0][inputs.shape[1]:],
                skip_special_tokens=True
            ).strip()
            
            # Clean up response if needed
            if not response:
                response = "I'm sorry, I couldn't generate a response. Could you please rephrase your question?"
            
            # Post-process to ensure markdown quality
            response = self._post_process_markdown(response)
            
            return response
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return "I encountered an error while processing your request. Please try again."
    
    def _post_process_markdown(self, response):
        """Post-process response to improve markdown formatting"""
        # Remove any trailing whitespace
        response = response.strip()
        
        # Ensure code blocks are properly formatted
        lines = response.split('\n')
        processed_lines = []
        in_code_block = False
        
        for line in lines:
            # Check for code block markers
            if line.strip().startswith('```'):
                in_code_block = not in_code_block
                processed_lines.append(line)
            elif in_code_block:
                # Preserve code block content exactly
                processed_lines.append(line)
            else:
                # Clean up regular markdown lines
                processed_lines.append(line)
        
        return '\n'.join(processed_lines) 