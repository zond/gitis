package routes

import (
	"github.com/gorilla/mux"
	"github.com/soundtrackyourbrand/utils/web/httpcontext"
	"github.com/zond/gitis/controller"
	"io"
	"model"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

func wantsJSON(r *http.Request, m *mux.RouteMatch) bool {
	return httpcontext.MostAccepted(r, "Accept", "text/html") == "application/json"
}

func wantsHTML(r *http.Request, m *mux.RouteMatch) bool {
	return httpcontext.MostAccepted(r, "Accept", "text/html") == "text/html"
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
		}).Handler(httpcontext.HandlerFunc(func(c httpcontext.HTTPContextLogger) (err error) {
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
			var in *os.File
			if in, err = os.Open(filepath.Join("static", cpy)); err != nil {
				return
			}
			defer in.Close()
			_, err = io.Copy(c.Resp(), in)
			return
		}))
	}
}

func init() {
	router := mux.NewRouter()

	router.Path("/js/{ver}/all.js").Handler(model.HTTPHandlerFunc(controller.AllJS))
	router.Path("/css/{ver}/all.css").Handler(model.HTTPHandlerFunc(controller.AllCSS))

	router.Path("/user").MatcherFunc(wantsJSON).Handler(model.JSONHandlerFunc(controller.User))

	projectsRouter := router.PathPrefix("/projects").MatcherFunc(wantsJSON).Subrouter()

	projectRouter := projectsRouter.PathPrefix("/{project_id}").Subrouter()
	projectRouter.Methods("DELETE").Handler(model.JSONHandlerFunc(controller.DeleteProject))

	projectsRouter.Methods("GET").Handler(model.JSONHandlerFunc(controller.Projects))
	projectsRouter.Methods("POST").Handler(model.JSONHandlerFunc(controller.CreateProject))

	router.Path("/login").MatcherFunc(wantsHTML).Handler(model.HTTPHandlerFunc(controller.Login))
	router.Path("/logout").MatcherFunc(wantsHTML).Handler(model.HTTPHandlerFunc(controller.Logout))
	router.Path("/oauth/local").MatcherFunc(wantsHTML).Handler(model.HTTPHandlerFunc(controller.OAuthLocal))
	router.Path("/oauth").MatcherFunc(wantsHTML).Handler(model.HTTPHandlerFunc(controller.OAuth))

	handleStatic(router, "static")

	router.PathPrefix("/").MatcherFunc(wantsHTML).Methods("GET").Handler(model.HTTPHandlerFunc(controller.Index))

	http.Handle("/", router)
}
