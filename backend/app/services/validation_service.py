"""
Validation service following Single Responsibility Principle.
Refactored to use common validation utilities and eliminate code duplication.
"""

import re
from typing import Dict, Any, List
from app.core.interfaces import ValidationInterface
from app.core.validation_utils import (
    TwitterContentValidator,
    validate_content_generation_request,
    validate_thread_generation_request
)


class ValidationService(ValidationInterface):
    """
    Service for validating user inputs and content.
    Refactored to use common validation utilities.
    """

    def validate_tweet_content(self, content: str) -> Dict[str, Any]:
        """Validate tweet content according to Twitter rules"""
        result = TwitterContentValidator.validate_tweet_content(content)

        # Add character count information
        response = result.to_dict()
        response.update(TwitterContentValidator.get_character_count_info(content))

        return response

    def validate_user_input(self, data: Dict[str, Any], rules: Dict[str, Any]) -> Dict[str, Any]:
        """Validate user input against provided rules"""
        errors = []

        for field, field_rules in rules.items():
            value = data.get(field)
            field_errors = self._validate_field(field, value, field_rules)
            errors.extend(field_errors)

        return {
            "is_valid": len(errors) == 0,
            "errors": errors
        }

    def validate_content_generation_request(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate content generation request"""
        result = validate_content_generation_request(data)
        return result.to_dict()

    def validate_thread_generation_request(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate thread generation request"""
        result = validate_thread_generation_request(data)
        return result.to_dict()

    def validate_scheduled_post_request(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate scheduled post request"""
        errors = []

        # Validate content
        content = data.get("content", "").strip()
        content_validation = self.validate_tweet_content(content)
        if not content_validation["is_valid"]:
            errors.extend(content_validation["errors"])

        # Validate scheduled time
        scheduled_time = data.get("scheduled_time")
        if not scheduled_time:
            errors.append("Scheduled time is required")
        # Additional datetime validation would go here

        return {
            "is_valid": len(errors) == 0,
            "errors": errors
        }

    def _validate_field(self, field_name: str, value: Any, rules: Dict[str, Any]) -> List[str]:
        """Validate a single field against its rules"""
        errors = []

        # Required validation
        if rules.get("required", False) and (value is None or value == ""):
            errors.append(f"{field_name} is required")
            return errors  # No point in further validation if required field is missing

        # Skip further validation if field is optional and empty
        if value is None or value == "":
            return errors

        # Type validation
        expected_type = rules.get("type")
        if expected_type and not isinstance(value, expected_type):
            errors.append(f"{field_name} must be of type {expected_type.__name__}")
            return errors

        # String-specific validations
        if isinstance(value, str):
            min_length = rules.get("min_length")
            if min_length and len(value) < min_length:
                errors.append(f"{field_name} must be at least {min_length} characters")

            max_length = rules.get("max_length")
            if max_length and len(value) > max_length:
                errors.append(f"{field_name} cannot exceed {max_length} characters")

            pattern = rules.get("pattern")
            if pattern and not re.match(pattern, value):
                errors.append(f"{field_name} format is invalid")

        # Numeric validations
        if isinstance(value, (int, float)):
            min_value = rules.get("min_value")
            if min_value is not None and value < min_value:
                errors.append(f"{field_name} must be at least {min_value}")

            max_value = rules.get("max_value")
            if max_value is not None and value > max_value:
                errors.append(f"{field_name} cannot exceed {max_value}")

        # Choice validation
        choices = rules.get("choices")
        if choices and value not in choices:
            errors.append(f"{field_name} must be one of: {', '.join(map(str, choices))}")

        return errors


# Global instance for dependency injection
validation_service = ValidationService()
