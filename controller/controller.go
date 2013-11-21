package controller

import (
	"bytes"
	"fmt"
	"github.com/soundtrackyourbrand/utils/gae/gaecontext"
	"strings"
	"text/template"
)

var htmlTemplates = template.Must(template.New("htmlTemplates").ParseGlob("templates/html/*.html"))
var jsModelTemplates = template.Must(template.New("jsModelTemplates").ParseGlob("templates/js/models/*.js"))
var jsCollectionTemplates = template.Must(template.New("jsCollectionTemplates").ParseGlob("templates/js/collections/*.js"))
var jsViewTemplates = template.Must(template.New("jsViewTemplates").ParseGlob("templates/js/views/*.js"))
var _Templates = template.Must(template.New("_Templates").ParseGlob("templates/_/*.html"))
var jsTemplates = template.Must(template.New("jsTemplates").ParseGlob("templates/js/*.js"))
var cssTemplates = template.Must(template.New("cssTemplates").ParseGlob("templates/css/*.css"))

func allCSS(c gaecontext.HTTPContext) {
	c.SetContentType("text/css; charset=UTF-8")
	renderText(c, cssTemplates, "bootstrap.min.css")
	renderText(c, cssTemplates, "bootstrap-theme.min.css")
	renderText(c, cssTemplates, "bootstrap-multiselect.css")
	renderText(c, cssTemplates, "common.css")
}

func renderText(c gaecontext.HTTPContext, templates *template.Template, template string) {
	if err := templates.ExecuteTemplate(c.Resp(), template, c); err != nil {
		panic(fmt.Errorf("While rendering text: %v", err))
	}
}

func render_Templates(c gaecontext.HTTPContext) {
	fmt.Fprintln(c.Resp(), "(function() {")
	fmt.Fprintln(c.Resp(), "  var n;")
	var buf *bytes.Buffer
	var rendered string
	for _, templ := range _Templates.Templates() {
		fmt.Fprintf(c.Resp(), "  n = $('<script type=\"text/template\" id=\"%v_underscore\"></script>');\n", strings.Split(templ.Name(), ".")[0])
		fmt.Fprintf(c.Resp(), "  n.text('")
		buf = new(bytes.Buffer)
		if err := templ.Execute(buf, c); err != nil {
			panic(err)
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
}

func allJS(c gaecontext.HTTPContext) {
	c.SetContentType("application/javascript; charset=UTF-8")
	renderText(c, jsTemplates, "jquery-2.0.3.min.js")
	renderText(c, jsTemplates, "underscore-min.js")
	renderText(c, jsTemplates, "backbone-min.js")
	renderText(c, jsTemplates, "bootstrap.min.js")
	renderText(c, jsTemplates, "bootstrap-multiselect.js")
	renderText(c, jsTemplates, "viz.js")
	renderText(c, jsTemplates, "tinycolor.js")
	render_Templates(c)
	for _, templ := range jsModelTemplates.Templates() {
		if err := templ.Execute(c.Resp(), c); err != nil {
			panic(err)
		}
	}
	for _, templ := range jsCollectionTemplates.Templates() {
		if err := templ.Execute(c.Resp(), c); err != nil {
			panic(err)
		}
	}
	for _, templ := range jsViewTemplates.Templates() {
		if err := templ.Execute(c.Resp(), c); err != nil {
			panic(err)
		}
	}
	renderText(c, jsTemplates, "app.js")
}

func Index(c gaecontext.HTTPContext) {
	c.SetContentType("text/html; charset=UTF-8")
	renderText(c, htmlTemplates, "index.html")

}
