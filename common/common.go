package common

import (
	"encoding/json"
	"github.com/gorilla/sessions"
	"github.com/soundtrackyourbrand/utils/gae/gaecontext"
	"github.com/soundtrackyourbrand/utils/web/jsoncontext"
	"net/http"
	"os"
	"time"
)

const (
	sessionName = "gitis_session"
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

var version = time.Now().UnixNano()
var store = sessions.NewCookieStore([]byte("something very secret"))

type GITISContext interface {
	Version() int64
	Session() *sessions.Session
	Save() error
	ClientId() string
}

type HTTPContext interface {
	gaecontext.HTTPContext
	GITISContext
}

type DefaultHTTPContext struct {
	gaecontext.HTTPContext
	session *sessions.Session
}

type JSONContext interface {
	gaecontext.JSONContext
	GITISContext
}

type DefaultJSONContext struct {
	gaecontext.JSONContext
	session *sessions.Session
}

func (self *DefaultHTTPContext) ClientId() string {
	return ClientId
}

func (self *DefaultHTTPContext) Version() int64 {
	return version
}

func (self *DefaultHTTPContext) Save() error {
	return self.session.Save(self.Req(), self.Resp())
}

func (self *DefaultHTTPContext) Session() *sessions.Session {
	return self.session
}

func (self *DefaultJSONContext) Version() int64 {
	return version
}

func (self *DefaultJSONContext) ClientId() string {
	return ClientId
}

func (self *DefaultJSONContext) Save() error {
	return self.session.Save(self.Req(), self.Resp())
}

func (self *DefaultJSONContext) Session() *sessions.Session {
	return self.session
}

func HTTPHandlerFunc(f func(HTTPContext) error) http.Handler {
	return gaecontext.HTTPHandlerFunc(func(httpContext gaecontext.HTTPContext) (err error) {
		var session *sessions.Session
		if session, err = store.Get(httpContext.Req(), sessionName); err != nil {
			return
		}
		c := &DefaultHTTPContext{
			HTTPContext: httpContext,
			session:     session,
		}
		defer func() {
			if err == nil {
				err = c.Save()
			}
		}()
		return f(c)
	})
}

func JSONHandlerFunc(f func(JSONContext) (jsoncontext.Resp, error)) http.Handler {
	return gaecontext.JSONHandlerFunc(func(jsonContext gaecontext.JSONContext) (result jsoncontext.Resp, err error) {
		session, err := store.Get(jsonContext.Req(), sessionName)
		if err != nil {
			err = jsoncontext.NewError(500, "Unable to store session", "", err)
			return
		}
		c := &DefaultJSONContext{
			JSONContext: jsonContext,
			session:     session,
		}
		defer func() {
			if err == nil {
				err = c.Save()
			}
		}()
		return f(c)
	})
}
