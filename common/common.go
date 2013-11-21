package common

import (
	"github.com/soundtrackyourbrand/utils/gae/gaecontext"
	"net/http"
	"time"
)

var version = time.Now().UnixNano()

type Context interface {
	gaecontext.HTTPContext
	Version() int64
}

type DefaultContext struct {
	gaecontext.HTTPContext
}

func (self *DefaultContext) Version() int64 {
	return version
}

func HandlerFunc(f func(Context)) http.Handler {
	return gaecontext.HTTPHandlerFunc(func(httpContext gaecontext.HTTPContext) {
		c := &DefaultContext{
			HTTPContext: httpContext,
		}
		f(c)
	})
}
