import openai
from typing import Optional, Dict, Any, List
from app.core.config import settings

class OpenAIService:
    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    
    async def generate_tweet(
        self, 
        topic: str, 
        style: str = "engaging", 
        user_context: Optional[str] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """Generate a tweet based on topic and style"""
        try:
            # Build the prompt
            prompt = self._build_tweet_prompt(topic, style, user_context, language)
            
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": self._get_system_prompt(language)},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=280,  # Twitter character limit consideration
                temperature=0.7,
                n=1
            )
            
            generated_text = response.choices[0].message.content.strip()
            
            return {
                "success": True,
                "content": generated_text,
                "prompt": prompt,
                "model": "gpt-4",
                "tokens_used": response.usage.total_tokens
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "content": None
            }
    
    async def generate_thread(
        self, 
        topic: str, 
        num_tweets: int = 3,
        style: str = "informative",
        language: str = "en"
    ) -> Dict[str, Any]:
        """Generate a Twitter thread"""
        try:
            prompt = f"""Create a Twitter thread about {topic} with {num_tweets} tweets.
            Style: {style}
            
            Requirements:
            - Each tweet should be under 280 characters
            - Number each tweet (1/n, 2/n, etc.)
            - Make it engaging and informative
            - Use appropriate hashtags
            - Ensure good flow between tweets
            
            Return as a JSON array of tweets."""
            
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": self._get_system_prompt(language)},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.7
            )
            
            generated_text = response.choices[0].message.content.strip()
            
            return {
                "success": True,
                "content": generated_text,
                "prompt": prompt,
                "model": "gpt-4",
                "tokens_used": response.usage.total_tokens
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "content": None
            }
    
    async def generate_reply(
        self, 
        original_tweet: str, 
        reply_style: str = "helpful",
        user_context: Optional[str] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """Generate a reply to a tweet"""
        try:
            prompt = f"""Generate a {reply_style} reply to this tweet:
            
            Original tweet: "{original_tweet}"
            
            Requirements:
            - Be respectful and on-topic
            - Under 280 characters
            - Add value to the conversation
            - Match the tone: {reply_style}
            {f"Context about user: {user_context}" if user_context else ""}
            """
            
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": self._get_system_prompt(language)},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=280,
                temperature=0.7
            )
            
            generated_text = response.choices[0].message.content.strip()
            
            return {
                "success": True,
                "content": generated_text,
                "prompt": prompt,
                "model": "gpt-4",
                "tokens_used": response.usage.total_tokens
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "content": None
            }
    
    def _build_tweet_prompt(self, topic: str, style: str, user_context: Optional[str], language: str) -> str:
        """Build a prompt for tweet generation"""
        prompt = f"""Create an engaging tweet about: {topic}
        
        Style: {style}
        Language: {language}
        
        Requirements:
        - Under 280 characters
        - Engaging and shareable
        - Include relevant hashtags (1-3)
        - No controversial content
        - Professional tone
        """
        
        if user_context:
            prompt += f"\nUser context: {user_context}"
            
        return prompt
    
    def _get_system_prompt(self, language: str) -> str:
        """Get system prompt based on language"""
        if language == "es":
            return """Eres un experto en redes sociales especializado en crear contenido atractivo para Twitter. 
            Crea tweets que sean informativos, entretenidos y que generen engagement. 
            Siempre respeta las políticas de Twitter y evita contenido controvertido."""
        else:
            return """You are a social media expert specializing in creating engaging Twitter content. 
            Create tweets that are informative, entertaining, and drive engagement. 
            Always respect Twitter's policies and avoid controversial content."""

# Global instance
openai_service = OpenAIService()
