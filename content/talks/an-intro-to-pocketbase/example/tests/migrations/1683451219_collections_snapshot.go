package migrations

import (
	"encoding/json"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/daos"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/models"
)

func init() {
	m.Register(func(db dbx.Builder) error {
		jsonData := `[
			{
				"id": "tzlbqz67xj5btck",
				"created": "2023-04-02 14:21:34.863Z",
				"updated": "2023-05-07 09:20:19.776Z",
				"name": "posts",
				"type": "base",
				"system": false,
				"schema": [
					{
						"system": false,
						"id": "ixwbpxoh",
						"name": "user",
						"type": "relation",
						"required": true,
						"unique": false,
						"options": {
							"collectionId": "_pb_users_auth_",
							"cascadeDelete": false,
							"minSelect": null,
							"maxSelect": 1,
							"displayFields": []
						}
					},
					{
						"system": false,
						"id": "uou8jj89",
						"name": "title",
						"type": "text",
						"required": true,
						"unique": false,
						"options": {
							"min": 0,
							"max": 100,
							"pattern": ""
						}
					}
				],
				"listRule": "@request.auth.id = user.id",
				"viewRule": "@request.auth.id = user.id",
				"createRule": "@request.auth.id != \"\"",
				"updateRule": "@request.auth.id = user.id",
				"deleteRule": "@request.auth.id = user.id",
				"options": {}
			},
			{
				"id": "x0893eixvf7znv5",
				"created": "2023-04-02 14:23:03.480Z",
				"updated": "2023-05-07 09:20:19.774Z",
				"name": "comments",
				"type": "base",
				"system": false,
				"schema": [
					{
						"system": false,
						"id": "nvkc9lwh",
						"name": "user",
						"type": "relation",
						"required": true,
						"unique": false,
						"options": {
							"collectionId": "_pb_users_auth_",
							"cascadeDelete": false,
							"minSelect": null,
							"maxSelect": 1,
							"displayFields": []
						}
					},
					{
						"system": false,
						"id": "oozrgrul",
						"name": "post",
						"type": "relation",
						"required": true,
						"unique": false,
						"options": {
							"collectionId": "tzlbqz67xj5btck",
							"cascadeDelete": false,
							"minSelect": null,
							"maxSelect": 1,
							"displayFields": []
						}
					},
					{
						"system": false,
						"id": "n4a0kbnw",
						"name": "message",
						"type": "text",
						"required": true,
						"unique": false,
						"options": {
							"min": 0,
							"max": 10000,
							"pattern": ""
						}
					}
				],
				"listRule": "@request.auth.id = user.id",
				"viewRule": "@request.auth.id = user.id",
				"createRule": "@request.auth.id != ''",
				"updateRule": "@request.auth.id = user.id",
				"deleteRule": "@request.auth.id = user.id",
				"options": {}
			},
			{
				"id": "_pb_users_auth_",
				"created": "2023-05-07 09:20:19.773Z",
				"updated": "2023-05-07 09:20:19.773Z",
				"name": "users",
				"type": "auth",
				"system": false,
				"schema": [
					{
						"system": false,
						"id": "users_name",
						"name": "name",
						"type": "text",
						"required": false,
						"unique": false,
						"options": {
							"min": null,
							"max": null,
							"pattern": ""
						}
					},
					{
						"system": false,
						"id": "users_avatar",
						"name": "avatar",
						"type": "file",
						"required": false,
						"unique": false,
						"options": {
							"maxSelect": 1,
							"maxSize": 5242880,
							"mimeTypes": [
								"image/jpeg",
								"image/png",
								"image/svg+xml",
								"image/gif",
								"image/webp"
							],
							"thumbs": null
						}
					}
				],
				"listRule": "id = @request.auth.id",
				"viewRule": "id = @request.auth.id",
				"createRule": "",
				"updateRule": "id = @request.auth.id",
				"deleteRule": "id = @request.auth.id",
				"options": {
					"allowEmailAuth": true,
					"allowOAuth2Auth": true,
					"allowUsernameAuth": true,
					"exceptEmailDomains": null,
					"manageRule": null,
					"minPasswordLength": 8,
					"onlyEmailDomains": null,
					"requireEmail": false
				}
			}
		]`

		collections := []*models.Collection{}
		if err := json.Unmarshal([]byte(jsonData), &collections); err != nil {
			return err
		}

		return daos.New(db).ImportCollections(collections, true, nil)
	}, func(db dbx.Builder) error {
		return nil
	})
}
