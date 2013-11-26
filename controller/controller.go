package controller

import (
	"appengine"
	"appengine/datastore"
	"appengine/urlfetch"
	"bytes"
	"common"
	"fmt"
	"github.com/soundtrackyourbrand/utils/web/jsoncontext"
	"io"
	"model"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"text/template"
	"time"
)

var htmlTemplates = template.Must(template.New("htmlTemplates").ParseGlob("templates/html/*.html"))
var jsModelTemplates = template.Must(template.New("jsModelTemplates").ParseGlob("templates/js/models/*.js"))
var jsCollectionTemplates = template.Must(template.New("jsCollectionTemplates").ParseGlob("templates/js/collections/*.js"))
var jsViewTemplates = template.Must(template.New("jsViewTemplates").ParseGlob("templates/js/views/*.js"))
var _Templates = template.Must(template.New("_Templates").ParseGlob("templates/_/*.html"))
var jsTemplates = template.Must(template.New("jsTemplates").ParseGlob("templates/js/*.js"))
var cssTemplates = template.Must(template.New("cssTemplates").ParseGlob("templates/css/*.css"))

func AllCSS(c model.HTTPContext) (err error) {
	c.SetContentType("text/css; charset=UTF-8")
	if err = renderText(c, cssTemplates, "bootstrap.min.css"); err != nil {
		return
	}
	if err = renderText(c, cssTemplates, "bootstrap-theme.min.css"); err != nil {
		return
	}
	if err = renderText(c, cssTemplates, "multi-select.css"); err != nil {
		return
	}
	err = renderText(c, cssTemplates, "common.css")
	return
}

func renderText(c model.HTTPContext, templates *template.Template, template string) error {
	return templates.ExecuteTemplate(c.Resp(), template, c)
}

func render_Templates(c model.HTTPContext) error {
	fmt.Fprintln(c.Resp(), "(function() {")
	fmt.Fprintln(c.Resp(), "  var n;")
	var buf *bytes.Buffer
	var rendered string
	for _, templ := range _Templates.Templates() {
		fmt.Fprintf(c.Resp(), "  n = $('<script type=\"text/template\" id=\"%v_underscore\"></script>');\n", strings.Split(templ.Name(), ".")[0])
		fmt.Fprintf(c.Resp(), "  n.text('")
		buf = new(bytes.Buffer)
		if err := templ.Execute(buf, c); err != nil {
			return err
		}
		rendered = string(buf.Bytes())
		rendered = strings.Replace(rendered, "\\", "\\\\", -1)
		rendered = strings.Replace(rendered, "'", "\\'", -1)
		rendered = strings.Replace(rendered, "\n", "\\n", -1)
		fmt.Fprint(c.Resp(), rendered)
		fmt.Fprintln(c.Resp(), "');")
		fmt.Fprintln(c.Resp(), "  $('head').append(n);")
	}
	fmt.Fprintln(c.Resp(), "})();")
	return nil
}

func AllJS(c model.HTTPContext) (err error) {
	c.SetContentType("application/javascript; charset=UTF-8")
	if err = renderText(c, jsTemplates, "jquery-2.0.3.min.js"); err != nil {
		return
	}
	if err = renderText(c, jsTemplates, "jquery.multi-select.js"); err != nil {
		return
	}
	if err = renderText(c, jsTemplates, "jquery-ui-1.10.3.custom.min.js"); err != nil {
		return
	}
	if err = renderText(c, jsTemplates, "underscore-min.js"); err != nil {
		return
	}
	if err = renderText(c, jsTemplates, "backbone-min.js"); err != nil {
		return
	}
	if err = renderText(c, jsTemplates, "bootstrap.min.js"); err != nil {
		return
	}
	if err = renderText(c, jsTemplates, "markdown.min.js"); err != nil {
		return
	}
	if err = renderText(c, jsTemplates, "baseView.js"); err != nil {
		return
	}
	if err = render_Templates(c); err != nil {
		return
	}
	for _, templ := range jsModelTemplates.Templates() {
		if err = templ.Execute(c.Resp(), c); err != nil {
			return
		}
	}
	for _, templ := range jsCollectionTemplates.Templates() {
		if err = templ.Execute(c.Resp(), c); err != nil {
			return
		}
	}
	for _, templ := range jsViewTemplates.Templates() {
		if err = templ.Execute(c.Resp(), c); err != nil {
			return
		}
	}
	return renderText(c, jsTemplates, "app.js")
}

func Index(c model.HTTPContext) error {
	c.SetContentType("text/html; charset=UTF-8")
	return renderText(c, htmlTemplates, "index.html")
}

func User(c model.JSONContext) (result jsoncontext.Resp, err error) {
	if c.User() == nil {
		result.Body = &model.User{}
	} else {
		result.Body = c.User()
	}
	return
}

func Logout(c model.HTTPContext) (err error) {
	c.Session().Values["user"] = nil
	if err = c.Save(); err != nil {
		return
	}
	c.Resp().Header().Set("Location", "/")
	c.Resp().WriteHeader(303)
	return
}

func CreateProject(c model.JSONContext) (result jsoncontext.Resp, err error) {
	project := &model.Project{}
	if err = c.DecodeJSON(project); err != nil {
		return
	}
	if err = project.Save(c); err != nil {
		return
	}
	result.Body = project
	return
}

func GetProjectById(c model.JSONContext) (result jsoncontext.Resp, err error) {
	var id *datastore.Key
	if id, err = datastore.DecodeKey(c.Vars()["project_id"]); err != nil {
		return
	}
	var project *model.Project
	if project, err = model.GetProjectById(c, id); err != nil {
		return
	}
	result.Body = project
	return
}

func UpdateProjectById(c model.JSONContext) (result jsoncontext.Resp, err error) {
	var id *datastore.Key
	if id, err = datastore.DecodeKey(c.Vars()["project_id"]); err != nil {
		return
	}
	var project *model.Project
	if project, err = model.GetProjectById(c, id); err != nil {
		return
	}
	if err = c.LoadJSON(project, "basic"); err != nil {
		return
	}
	if err = project.Save(c); err != nil {
		return
	}
	result.Body = project
	return
}

func DeleteProjectById(c model.JSONContext) (result jsoncontext.Resp, err error) {
	var id *datastore.Key
	if id, err = datastore.DecodeKey(c.Vars()["project_id"]); err != nil {
		return
	}
	var project *model.Project
	if project, err = model.GetProjectById(c, id); err != nil {
		return
	}
	if err = project.Delete(c); err != nil {
		return
	}
	result.Status = 204
	return
}

func Projects(c model.JSONContext) (result jsoncontext.Resp, err error) {
	var projects model.Projects
	if projects, err = model.GetProjectsByUserId(c); err != nil {
		return
	}
	result.Body = projects
	return
}

func Login(c model.HTTPContext) (err error) {
	if appengine.IsDevAppServer() {
		c.Resp().Header().Set("Location", fmt.Sprintf("https://github.com/login/oauth/authorize?client_id=%s&scope=repo&state=%v&redirect_uri=%s", common.ClientId, time.Now().UnixNano(), common.LocalRedirectURL))
		c.Resp().WriteHeader(303)
	} else {
		c.Resp().Header().Set("Location", fmt.Sprintf("https://github.com/login/oauth/authorize?client_id=%s&scope=repo&state=%v", common.ClientId, time.Now().UnixNano()))
		c.Resp().WriteHeader(303)
	}
	return
}

func OAuth(c model.HTTPContext) (err error) {
	if err = oAuth(c); err != nil {
		return
	}
	c.Resp().Header().Set("Location", "/")
	c.Resp().WriteHeader(303)
	return
}

func OAuthLocal(c model.HTTPContext) (err error) {
	c.Resp().Header().Set("Location", fmt.Sprintf("http://localhost:%v/oauth?%s", common.LocalPort, c.Req().URL.RawQuery))
	c.Resp().WriteHeader(303)
	return
}

func oAuth(c model.HTTPContext) (err error) {
	var state int64
	if state, err = strconv.ParseInt(c.Req().URL.Query().Get("state"), 10, 64); err != nil {
		return
	}
	now := time.Now()
	stateTime := time.Unix(0, state)
	diff := now.Sub(stateTime)
	if now.Sub(stateTime) > time.Minute {
		err = fmt.Errorf("Now is %v, state is %v, diff is too long: %v", now, stateTime, diff)
		return
	}
	client := urlfetch.Client(c)
	var req *http.Request
	if req, err = http.NewRequest("POST", "https://github.com/login/oauth/access_token", bytes.NewBuffer([]byte(url.Values{
		"client_id":     {common.ClientId},
		"client_secret": {common.ClientSecret},
		"code":          {c.Req().URL.Query().Get("code")},
	}.Encode()))); err != nil {
		return
	}
	var resp *http.Response
	if resp, err = client.Do(req); err != nil {
		return
	}
	if resp.StatusCode != 200 {
		err = fmt.Errorf("Got %+v when doing %+v", resp, req)
		return
	}
	buf := &bytes.Buffer{}
	if _, err = io.Copy(buf, resp.Body); err != nil {
		return
	}
	var values url.Values
	if values, err = url.ParseQuery(buf.String()); err != nil {
		return
	}
	if values.Get("scope") != "repo" {
		err = fmt.Errorf("Unknown scope %#v", values.Get("scope"))
		return
	}
	if values.Get("token_type") != "bearer" {
		err = fmt.Errorf("Unknown token type %#v", values.Get("token_type"))
		return
	}
	user := &model.User{
		AccessToken: values.Get("access_token"),
	}
	if err = user.Load(c); err != nil {
		return
	}
	c.Session().Values["user"] = user
	if err = c.Save(); err != nil {
		return
	}
	return
}
