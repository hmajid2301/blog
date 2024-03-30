package main

import (
	"fmt"

	"github.com/elliotchance/phpserialize"
)

func main() {
	res := []interface{}{"ROLE", "ROLE_ADMIN"}
	out, err := phpserialize.Marshal(res, nil)
	if err != nil {
		panic(err)
	}

	fmt.Println(string(out))

	var in float64
	err = phpserialize.Unmarshal(out, &in)

	fmt.Println(in)
}
