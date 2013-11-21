package model

import (
	"appengine/urlfetch"
	"encoding/gob"
	"encoding/json"
	"fmt"
	"github.com/soundtrackyourbrand/utils/gae/gaecontext"
	"net/http"
)

func init() {
	gob.Register(User{})
}

type User struct {
	AccessToken string `json:"access_token"`
	AvatarUrl   string `json:"avatar_url"`
	Login       string `json:"login"`
	Id          int    `json:"id"`
}

func (self *User) Load(c gaecontext.GAEContext) (err error) {
	client := urlfetch.Client(c)
	var req *http.Request
	if req, err = http.NewRequest("GET", "https://api.github.com/user", nil); err != nil {
		return
	}
	req.Header.Set("Authorization", fmt.Sprintf("token %v", self.AccessToken))
	var resp *http.Response
	if resp, err = client.Do(req); err != nil {
		return
	}
	if resp.StatusCode != 200 {
		err = fmt.Errorf("Got %v from %+v", resp, req)
		return
	}
	return json.NewDecoder(resp.Body).Decode(self)
}
