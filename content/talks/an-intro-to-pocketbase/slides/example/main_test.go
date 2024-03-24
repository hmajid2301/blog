package main

import (
	"net/http"
	"testing"

	"github.com/pocketbase/pocketbase/tests"
	"github.com/pocketbase/pocketbase/tokens"
)

// username: test@example.com
// password: password11
const testDataDir = "./tests/pb_data"

func TestCommentEndpoint(t *testing.T) {
	recordToken, err := generateRecordToken("users", "test@example.com")
	if err != nil {
		t.Fatal(err)
	}

	setupTestApp := func() (*tests.TestApp, error) {
		testApp, err := tests.NewTestApp(testDataDir)
		if err != nil {
			return nil, err
		}

		bindAppHooks(testApp)
		return testApp, nil
	}

	scenarios := []tests.ApiScenario{
		{
			Name:   "try to get response",
			Url:    "/comment",
			Method: http.MethodPost,
			RequestHeaders: map[string]string{
				"Authorization": recordToken,
			},
			ExpectedStatus:  201,
			ExpectedContent: nil,
			ExpectedEvents:  map[string]int{"OnModelAfterCreate": 1, "OnModelBeforeCreate": 1},
			TestAppFactory:  setupTestApp,
		},
	}

	for _, scenario := range scenarios {
		scenario.Test(t)
	}
}

func generateRecordToken(collectionNameOrId string, email string) (string, error) {
	app, err := tests.NewTestApp(testDataDir)
	if err != nil {
		return "", err
	}
	defer app.Cleanup()

	record, err := app.Dao().FindAuthRecordByEmail(collectionNameOrId, email)
	if err != nil {
		return "", err
	}

	return tokens.NewRecordAuthToken(app, record)
}
