package errors

import (
	"errors"
	"fmt"
	"net/http"
)

type AppError struct {
	Code       string `json:"code"`
	Message    string `json:"message"`
	HTTPStatus int    `json:"-"`
	Err        error  `json:"-"`
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %v", e.Message, e.Err)
	}
	return e.Message
}

func (e *AppError) Unwrap() error {
	return e.Err
}

var (
	ErrUserNotFound = &AppError{
		Code:       "USER_NOT_FOUND",
		Message:    "User not found",
		HTTPStatus: http.StatusNotFound,
	}

	ErrInvalidUserID = &AppError{
		Code:       "INVALID_USER_ID",
		Message:    "Invalid user ID format",
		HTTPStatus: http.StatusBadRequest,
	}

	ErrInvalidRequestBody = &AppError{
		Code:       "INVALID_REQUEST_BODY",
		Message:    "Invalid request body",
		HTTPStatus: http.StatusBadRequest,
	}

	ErrValidationFailed = &AppError{
		Code:       "VALIDATION_FAILED",
		Message:    "Request validation failed",
		HTTPStatus: http.StatusBadRequest,
	}

	ErrDuplicateEmail = &AppError{
		Code:       "DUPLICATE_EMAIL",
		Message:    "Email address already exists",
		HTTPStatus: http.StatusConflict,
	}

	ErrPaymentFailed = &AppError{
		Code:       "PAYMENT_FAILED",
		Message:    "Payment processing failed",
		HTTPStatus: http.StatusPaymentRequired,
	}

	ErrDatabaseConnection = &AppError{
		Code:       "DATABASE_CONNECTION",
		Message:    "Database connection failed",
		HTTPStatus: http.StatusServiceUnavailable,
	}

	ErrInternalServer = &AppError{
		Code:       "INTERNAL_SERVER_ERROR",
		Message:    "Internal server error",
		HTTPStatus: http.StatusInternalServerError,
	}
)

func NewAppError(code, message string, httpStatus int, err error) *AppError {
	return &AppError{
		Code:       code,
		Message:    message,
		HTTPStatus: httpStatus,
		Err:        err,
	}
}

func NewValidationError(message string, err error) *AppError {
	return &AppError{
		Code:       "VALIDATION_FAILED",
		Message:    message,
		HTTPStatus: http.StatusBadRequest,
		Err:        err,
	}
}

func NewInternalError(err error) *AppError {
	return &AppError{
		Code:       "INTERNAL_SERVER_ERROR",
		Message:    "Internal server error",
		HTTPStatus: http.StatusInternalServerError,
		Err:        err,
	}
}

func IsAppError(err error) (*AppError, bool) {
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr, true
	}
	return nil, false
}
