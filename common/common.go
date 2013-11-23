package common

import (
	"encoding/json"
	"os"
)

var ClientId string
var ClientSecret string

type configuration struct {
	ClientSecret string
	ClientId     string
}

func init() {
	configFile, err := os.Open("config.json")
	if err != nil {
		panic(err)
	}
	defer configFile.Close()
	var config configuration
	if err = json.NewDecoder(configFile).Decode(&config); err != nil {
		panic(err)
	}
	ClientId = config.ClientId
	ClientSecret = config.ClientSecret
}
