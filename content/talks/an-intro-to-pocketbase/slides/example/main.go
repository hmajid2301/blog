package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	_ "gitlab.com/hmajid2301/talks/an-intro-to-pocketbase/example/migrations"
)

var _ models.Model = (*Comments)(nil)

type Comments struct {
	models.BaseModel
	User    string `db:"user"`
	Message string `db:"message"`
	Post    string `db:"post"`
}

func (c *Comments) TableName() string {
	return "comments"
}

func main() {
	app := pocketbase.New()
	migratecmd.MustRegister(app, app.RootCmd, &migratecmd.Options{
		Automigrate: true,
	})

	bindAppHooks(app)

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

func bindAppHooks(app core.App) {
	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		e.Router.POST("/comment", func(c echo.Context) error {
			authRecord, _ := c.Get(apis.ContextAuthRecordKey).(*models.Record)
			message := fmt.Sprintf("Hi %s 👋, welcome to London Gophers!", authRecord.Username())
			commentRecord := &Comments{
				User:    authRecord.Id,
				Message: message,
				// Placeholder
				Post: "1",
			}

			err := app.Dao().Save(commentRecord)
			if err != nil {
				return err
			}

			return c.NoContent(http.StatusCreated)
		},
			apis.ActivityLogger(app),
			apis.RequireRecordAuth(),
		)
		return nil
	})
}
