package routes

import (
	"github.com/gorilla/mux"
	"github.com/soundtrackyourbrand/utils/gae/gaecontext"
	"github.com/soundtrackyourbrand/utils/web/httpcontext"
	"github.com/zond/gitis/controller"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

func wantsJSON(r *http.Request, m *mux.RouteMatch) bool {
	return httpcontext.MostAccepted(r, "text/html", "Accept") == "application/json"
}

func wantsHTML(r *http.Request, m *mux.RouteMatch) bool {
	return httpcontext.MostAccepted(r, "text/html", "Accept") == "text/html"
}

func handleStatic(router *mux.Router, dir string) {
	static, err := os.Open(dir)
	if err != nil {
		panic(err)
	}
	children, err := static.Readdirnames(-1)
	if err != nil {
		panic(err)
	}
	for _, fil := range children {
		cpy := fil
		router.MatcherFunc(func(r *http.Request, rm *mux.RouteMatch) bool {
			return strings.HasSuffix(r.URL.Path, cpy)
		}).Handler(gaecontext.HTTPHandlerFunc(func(c gaecontext.HTTPContext) {
			if strings.HasSuffix(c.Req().URL.Path, ".css") {
				c.SetContentType("text/css; charset=UTF-8")
			} else if strings.HasSuffix(c.Req().URL.Path, ".js") {
				c.SetContentType("application/javascript; charset=UTF-8")
			} else if strings.HasSuffix(c.Req().URL.Path, ".png") {
				c.SetContentType("image/png")
			} else if strings.HasSuffix(c.Req().URL.Path, ".gif") {
				c.SetContentType("image/gif")
			} else if strings.HasSuffix(c.Req().URL.Path, ".woff") {
				c.SetContentType("application/font-woff")
			} else if strings.HasSuffix(c.Req().URL.Path, ".ttf") {
				c.SetContentType("font/truetype")
			} else {
				c.SetContentType("application/octet-stream")
			}
			if in, err := os.Open(filepath.Join("static", cpy)); err != nil {
				c.Resp().WriteHeader(500)
			} else {
				defer in.Close()
				if _, err := io.Copy(c.Resp(), in); err != nil {
					c.Resp().WriteHeader(500)
				}
			}
		}))
	}
}

func init() {
	router := mux.NewRouter()

	router.PathPrefix("/").Methods("GET").Handler(gaecontext.HTTPHandlerFunc(controller.Index))

	handleStatic(router, "static")

	http.Handle("/", router)
}
