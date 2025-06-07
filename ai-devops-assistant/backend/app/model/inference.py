import torch
import logging
from utils.config import Config

logger = logging.getLogger(__name__)

class ModelInference:
    def __init__(self, model_loader):
        self.model = model_loader.get_model()
        self.tokenizer = model_loader.get_tokenizer()
        self.device = next(self.model.parameters()).device
    
    def format_messages(self, messages):
        """Format messages for the model"""
        formatted_text = ""
        for message in messages:
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
            # Format the conversation
            prompt = self.format_messages(messages)
            
            # Tokenize input
            inputs = self.tokenizer.encode(
                prompt,
                return_tensors="pt",
                truncation=True,
                max_length=Config.MAX_INPUT_LENGTH
            ).to(self.device)
            
            # Generate response
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs,
                    max_new_tokens=Config.MAX_NEW_TOKENS,
                    temperature=Config.TEMPERATURE,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id,
                    attention_mask=torch.ones_like(inputs)
                )
            
            # Decode response
            response = self.tokenizer.decode(
                outputs[0][inputs.shape[1]:],
                skip_special_tokens=True
            ).strip()
            
            # Clean up response if needed
            if not response:
                response = "I'm sorry, I couldn't generate a response. Could you please rephrase your question?"
            
            return response
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return "I encountered an error while processing your request. Please try again." 