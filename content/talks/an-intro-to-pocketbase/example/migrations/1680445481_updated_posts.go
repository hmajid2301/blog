package migrations

import (
	"encoding/json"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/daos"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/models/schema"
)

func init() {
	m.Register(func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("tzlbqz67xj5btck")
		if err != nil {
			return err
		}

		// add
		new_title := &schema.SchemaField{}
		json.Unmarshal([]byte(`{
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
		}`), new_title)
		collection.Schema.AddField(new_title)

		return dao.SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("tzlbqz67xj5btck")
		if err != nil {
			return err
		}

		// remove
		collection.Schema.RemoveField("uou8jj89")

		return dao.SaveCollection(collection)
	})
}
