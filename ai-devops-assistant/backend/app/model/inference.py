import torch
import logging
from utils.config import Config

logger = logging.getLogger(__name__)

class ModelInference:
    def __init__(self, model_loader):
        self.model = model_loader.get_model()
        self.tokenizer = model_loader.get_tokenizer()
        self.device = next(self.model.parameters()).device
    
    def generate_response(self, messages):
        """Generate response from the model with simple, reliable approach"""
        try:
            # Get the user's question
            user_message = ""
            for message in messages:
                if message.get('role') == 'user':
                    user_message = message.get('content', '')
                    break
            
            if not user_message:
                return "I didn't receive a valid question. Please ask me something about DevOps!"
            
            # Simple prompt format that works well with Llama
            prompt = f"Question: {user_message}\nAnswer:"
            
            # Tokenize with conservative limits
            inputs = self.tokenizer.encode(
                prompt,
                return_tensors="pt",
                truncation=True,
                max_length=512  # Keep it short for speed
            ).to(self.device)
            
            # Generate with fast, reliable settings
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs,
                    max_new_tokens=150,  # Shorter for speed
                    temperature=0.7,
                    do_sample=True,
                    top_p=0.9,
                    pad_token_id=self.tokenizer.eos_token_id,
                    eos_token_id=self.tokenizer.eos_token_id,
                    repetition_penalty=1.1
                )
            
            # Decode response
            response = self.tokenizer.decode(
                outputs[0][inputs.shape[1]:],
                skip_special_tokens=True
            ).strip()
            
            # Clean up response
            if not response:
                response = "I'm a DevOps AI assistant. I can help with Docker, Kubernetes, CI/CD, monitoring, and infrastructure questions."
            
            return response
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return f"DevOps AI Assistant: I can help with infrastructure, containers, automation, and deployment questions. Please try asking about Docker, Kubernetes, or CI/CD." 