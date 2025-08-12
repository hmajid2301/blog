package validation

import (
	"fmt"
	"net/mail"
	"strings"
	"unicode/utf8"

	"github.com/hmajid2301/user-service/internal/errors"
)

type CreateUserRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

type ValidationErrors []ValidationError

func (v ValidationErrors) Error() string {
	if len(v) == 0 {
		return ""
	}

	var messages []string
	for _, err := range v {
		messages = append(messages, fmt.Sprintf("%s: %s", err.Field, err.Message))
	}
	return strings.Join(messages, ", ")
}

func ValidateCreateUserRequest(req *CreateUserRequest) error {
	var validationErrors ValidationErrors

	if err := validateName(req.Name); err != nil {
		validationErrors = append(validationErrors, ValidationError{
			Field:   "name",
			Message: err.Error(),
		})
	}

	if err := validateEmail(req.Email); err != nil {
		validationErrors = append(validationErrors, ValidationError{
			Field:   "email",
			Message: err.Error(),
		})
	}

	if len(validationErrors) > 0 {
		return errors.NewValidationError(validationErrors.Error(), nil)
	}

	return nil
}

func validateName(name string) error {
	name = strings.TrimSpace(name)

	if name == "" {
		return fmt.Errorf("name is required")
	}

	if utf8.RuneCountInString(name) < 2 {
		return fmt.Errorf("name must be at least 2 characters long")
	}

	if utf8.RuneCountInString(name) > 100 {
		return fmt.Errorf("name must be less than 100 characters long")
	}

	if containsOnlyWhitespace(name) {
		return fmt.Errorf("name cannot contain only whitespace")
	}

	return nil
}

func validateEmail(email string) error {
	email = strings.TrimSpace(email)

	if email == "" {
		return fmt.Errorf("email is required")
	}

	if utf8.RuneCountInString(email) > 254 {
		return fmt.Errorf("email must be less than 254 characters long")
	}

	if _, err := mail.ParseAddress(email); err != nil {
		return fmt.Errorf("invalid email format")
	}

	return nil
}

func containsOnlyWhitespace(s string) bool {
	return strings.TrimSpace(s) == ""
}
