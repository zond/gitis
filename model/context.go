package model

import (
	"common"
	"github.com/gorilla/sessions"
	"github.com/soundtrackyourbrand/utils/gae/gaecontext"
	"github.com/soundtrackyourbrand/utils/web/httpcontext"
	"github.com/soundtrackyourbrand/utils/web/jsoncontext"
	"net/http"
	"time"
)

const (
	sessionName = "gitis_session"
)

var version = time.Now().UnixNano()
var store = sessions.NewCookieStore([]byte("something very secret"))

type Context interface {
	User() *User
	ClientId() string
	Version() int64
	Save() error
	Session() *sessions.Session
}

type DefaultContext struct {
	session     *sessions.Session
	user        *User
	HTTPContext httpcontext.HTTPContext
}

func (self *DefaultContext) User() *User {
	return self.user
}

func (self *DefaultContext) ClientId() string {
	return common.ClientId
}

func (self *DefaultContext) Version() int64 {
	return version
}

func (self *DefaultContext) Save() error {
	return self.session.Save(self.HTTPContext.Req(), self.HTTPContext.Resp())
}

func (self *DefaultContext) Session() *sessions.Session {
	return self.session
}

func NewContext(httpContext httpcontext.HTTPContext) (result *DefaultContext, err error) {
	var session *sessions.Session
	if session, err = store.Get(httpContext.Req(), sessionName); err != nil {
		return
	}
	result = &DefaultContext{
		HTTPContext: httpContext,
		session:     session,
	}
	if user, ok := session.Values["user"].(User); ok {
		result.user = &user
	}
	return
}

type HTTPContext interface {
	gaecontext.HTTPContext
	Context
}

type JSONContext interface {
	gaecontext.JSONContext
	Context
}

type DefaultHTTPContext struct {
	gaecontext.HTTPContext
	Context
}

type DefaultJSONContext struct {
	gaecontext.JSONContext
	Context
}

func HTTPHandlerFunc(f func(HTTPContext) error) http.Handler {
	return gaecontext.HTTPHandlerFunc(func(httpContext gaecontext.HTTPContext) (err error) {
		var gitisContext *DefaultContext
		if gitisContext, err = NewContext(httpContext); err != nil {
			return
		}
		c := &DefaultHTTPContext{
			HTTPContext: httpContext,
			Context:     gitisContext,
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
		var gitisContext *DefaultContext
		if gitisContext, err = NewContext(jsonContext); err != nil {
			return
		}
		c := &DefaultJSONContext{
			JSONContext: jsonContext,
			Context:     gitisContext,
		}
		defer func() {
			if err == nil {
				err = c.Save()
			}
		}()
		return f(c)
	})
}
