package common

import (
	"encoding/json"
	"fmt"
	"os"
)

var ClientId string
var ClientSecret string
var LocalRedirectURL string
var LocalPort int

type configuration struct {
	ClientSecret     string
	ClientId         string
	LocalRedirectURL string
	LocalPort        int
}

func init() {
	configFile, err := os.Open("config.json")
	if err != nil {
		panic(fmt.Sprintf("You must have a config.json file. Look at config.json.template as an example."))
	}
	defer configFile.Close()
	var config configuration
	if err = json.NewDecoder(configFile).Decode(&config); err != nil {
		panic(err)
	}
	ClientId = config.ClientId
	ClientSecret = config.ClientSecret
	LocalRedirectURL = config.LocalRedirectURL
	LocalPort = config.LocalPort
}
