package migrations

import (
	"encoding/json"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/daos"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/models/schema"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	m.Register(func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("x0893eixvf7znv5")
		if err != nil {
			return err
		}

		collection.ListRule = types.Pointer("@request.auth.id = user.id")

		collection.ViewRule = types.Pointer("@request.auth.id = user.id")

		collection.CreateRule = types.Pointer("@request.auth.id != ''")

		collection.UpdateRule = types.Pointer("@request.auth.id = user.id")

		collection.DeleteRule = types.Pointer("@request.auth.id = user.id")

		// add
		new_post := &schema.SchemaField{}
		json.Unmarshal([]byte(`{
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
		}`), new_post)
		collection.Schema.AddField(new_post)

		// add
		new_message := &schema.SchemaField{}
		json.Unmarshal([]byte(`{
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
		}`), new_message)
		collection.Schema.AddField(new_message)

		return dao.SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("x0893eixvf7znv5")
		if err != nil {
			return err
		}

		collection.ListRule = nil

		collection.ViewRule = nil

		collection.CreateRule = nil

		collection.UpdateRule = nil

		collection.DeleteRule = nil

		// remove
		collection.Schema.RemoveField("oozrgrul")

		// remove
		collection.Schema.RemoveField("n4a0kbnw")

		return dao.SaveCollection(collection)
	})
}
