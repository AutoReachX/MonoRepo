import openai
from typing import Optional, Dict, Any, List
from app.core.config import settings
from app.core.interfaces import ContentGeneratorInterface
from app.core.constants import OpenAIConstants, ContentConstants, TwitterConstants
from app.core.exceptions import OpenAIAPIError, ValidationError


class PromptBuilder:
    """Separate class for building prompts - follows SRP"""

    @staticmethod
    def build_tweet_prompt(topic: str, style: str, user_context: Optional[str], language: str) -> str:
        """Build a prompt for tweet generation"""
        prompt = f"""Create an engaging tweet about: {topic}

        Style: {style}
        Language: {language}

        Requirements:
        - Under {OpenAIConstants.TWEET_MAX_TOKENS} characters
        - Engaging and shareable
        - Include relevant hashtags (1-3)
        - No controversial content
        - Professional tone
        """

        if user_context:
            prompt += f"\nUser context: {user_context}"

        return prompt

    @staticmethod
    def build_thread_prompt(topic: str, num_tweets: int, style: str, language: str) -> str:
        """Build a prompt for thread generation"""
        return f"""Create a Twitter thread about {topic} with {num_tweets} tweets.
        Style: {style}

        Requirements:
        - Each tweet should be under {OpenAIConstants.TWEET_MAX_TOKENS} characters
        - Number each tweet (1/n, 2/n, etc.)
        - Make it engaging and informative
        - Use appropriate hashtags
        - Ensure good flow between tweets

        Return as a JSON array of tweets."""

    @staticmethod
    def build_reply_prompt(original_tweet: str, reply_style: str, user_context: Optional[str], language: str) -> str:
        """Build a prompt for reply generation"""
        prompt = f"""Generate a {reply_style} reply to this tweet:

        Original tweet: "{original_tweet}"

        Requirements:
        - Be respectful and on-topic
        - Under {OpenAIConstants.TWEET_MAX_TOKENS} characters
        - Add value to the conversation
        - Match the tone: {reply_style}
        {f"Context about user: {user_context}" if user_context else ""}
        """
        return prompt

    @staticmethod
    def get_system_prompt(language: str) -> str:
        """Get system prompt based on language"""
        if language == "es":
            return """Eres un experto en redes sociales especializado en crear contenido atractivo para Twitter.
            Crea tweets que sean informativos, entretenidos y que generen engagement.
            Siempre respeta las políticas de Twitter y evita contenido controvertido."""
        else:
            return """You are a social media expert specializing in creating engaging Twitter content.
            Create tweets that are informative, entertaining, and drive engagement.
            Always respect Twitter's policies and avoid controversial content."""


class OpenAIService(ContentGeneratorInterface):
    """OpenAI service implementing ContentGeneratorInterface"""

    def __init__(self, api_key: Optional[str] = None, client: Optional[openai.OpenAI] = None):
        """
        Initialize OpenAI service with dependency injection support

        Args:
            api_key: OpenAI API key (defaults to settings if not provided)
            client: Pre-configured OpenAI client (for testing)
        """
        self.api_key = api_key or settings.OPENAI_API_KEY

        if client:
            self.client = client
        elif self.api_key:
            self.client = openai.OpenAI(api_key=self.api_key)
        else:
            # Allow initialization without API key for testing
            self.client = None

        self.prompt_builder = PromptBuilder()

    def _ensure_client(self) -> None:
        """Ensure client is initialized before use"""
        if not self.client:
            if not self.api_key:
                raise ValidationError("OpenAI API key is required")
            self.client = openai.OpenAI(api_key=self.api_key)

    async def generate_tweet(
        self,
        topic: str,
        style: str = ContentConstants.DEFAULT_STYLE,
        user_context: Optional[str] = None,
        language: str = ContentConstants.DEFAULT_LANGUAGE
    ) -> Dict[str, Any]:
        """Generate a tweet based on topic and style"""
        try:
            self._ensure_client()

            # Build the prompt
            prompt = self.prompt_builder.build_tweet_prompt(topic, style, user_context, language)

            response = self.client.chat.completions.create(
                model=OpenAIConstants.DEFAULT_MODEL,
                messages=[
                    {"role": "system", "content": self.prompt_builder.get_system_prompt(language)},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=OpenAIConstants.TWEET_MAX_TOKENS,
                temperature=OpenAIConstants.DEFAULT_TEMPERATURE,
                n=OpenAIConstants.DEFAULT_N
            )

            generated_text = response.choices[0].message.content.strip()

            return {
                "success": True,
                "content": generated_text,
                "prompt": prompt,
                "model": OpenAIConstants.DEFAULT_MODEL,
                "tokens_used": response.usage.total_tokens
            }

        except Exception as e:
            raise OpenAIAPIError(f"Tweet generation failed: {str(e)}", {"topic": topic, "style": style})

    async def generate_thread(
        self,
        topic: str,
        num_tweets: int = TwitterConstants.DEFAULT_THREAD_SIZE,
        style: str = "informative",
        language: str = ContentConstants.DEFAULT_LANGUAGE
    ) -> Dict[str, Any]:
        """Generate a Twitter thread"""
        try:
            self._ensure_client()

            prompt = self.prompt_builder.build_thread_prompt(topic, num_tweets, style, language)

            response = self.client.chat.completions.create(
                model=OpenAIConstants.DEFAULT_MODEL,
                messages=[
                    {"role": "system", "content": self.prompt_builder.get_system_prompt(language)},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=OpenAIConstants.THREAD_MAX_TOKENS,
                temperature=OpenAIConstants.DEFAULT_TEMPERATURE
            )

            generated_text = response.choices[0].message.content.strip()

            return {
                "success": True,
                "content": generated_text,
                "prompt": prompt,
                "model": OpenAIConstants.DEFAULT_MODEL,
                "tokens_used": response.usage.total_tokens
            }

        except Exception as e:
            raise OpenAIAPIError(f"Thread generation failed: {str(e)}", {"topic": topic, "num_tweets": num_tweets})

    async def generate_reply(
        self,
        original_tweet: str,
        reply_style: str = "helpful",
        user_context: Optional[str] = None,
        language: str = ContentConstants.DEFAULT_LANGUAGE
    ) -> Dict[str, Any]:
        """Generate a reply to a tweet"""
        try:
            self._ensure_client()

            prompt = self.prompt_builder.build_reply_prompt(original_tweet, reply_style, user_context, language)

            response = self.client.chat.completions.create(
                model=OpenAIConstants.DEFAULT_MODEL,
                messages=[
                    {"role": "system", "content": self.prompt_builder.get_system_prompt(language)},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=OpenAIConstants.REPLY_MAX_TOKENS,
                temperature=OpenAIConstants.DEFAULT_TEMPERATURE
            )

            generated_text = response.choices[0].message.content.strip()

            return {
                "success": True,
                "content": generated_text,
                "prompt": prompt,
                "model": OpenAIConstants.DEFAULT_MODEL,
                "tokens_used": response.usage.total_tokens
            }

        except Exception as e:
            raise OpenAIAPIError(f"Reply generation failed: {str(e)}", {"original_tweet": original_tweet, "reply_style": reply_style})


# Factory function for dependency injection
def create_openai_service(api_key: Optional[str] = None, client: Optional[openai.OpenAI] = None) -> OpenAIService:
    """Create an OpenAI service instance"""
    return OpenAIService(api_key=api_key, client=client)
