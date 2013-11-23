package model

import (
	"appengine/datastore"
	"bytes"
	"fmt"
	"github.com/soundtrackyourbrand/utils/gae"
	"github.com/soundtrackyourbrand/utils/gae/memcache"
	"github.com/soundtrackyourbrand/utils/web/jsoncontext"
	"sort"
	"time"
)

type Projects []Project

func (self Projects) Len() int {
	return len(self)
}

func (self Projects) Swap(i, j int) {
	self[i], self[j] = self[j], self[i]
}

func (self Projects) Less(i, j int) bool {
	return bytes.Compare([]byte(self[i].Name), []byte(self[j].Name)) < 0
}

type Project struct {
	Id        *datastore.Key `datastore:"-"`
	UserId    int
	Name      string
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (self *Project) Save(c HTTPContext) (err error) {
	self.UserId = c.User().Id
	self.UpdatedAt = time.Now()
	if self.Id == nil {
		self.CreatedAt = time.Now()
		self.Id, err = datastore.Put(c, datastore.NewKey(c, "Project", "", 0, nil), self)
	} else {
		_, err = datastore.Put(c, self.Id, self)
	}
	if err != nil {
		return
	}
	err = memcache.Del(c, projectsKeyByUserId(self.UserId), projectKeyByUserIdAndId(self.UserId, self.Id))
	return
}

func (self *Project) Delete(c HTTPContext) (err error) {
	if err = datastore.Delete(c, self.Id); err != nil {
		return
	}
	err = memcache.Del(c, projectsKeyByUserId(self.UserId), projectKeyByUserIdAndId(self.UserId, self.Id))
	return
}

func projectKeyByUserIdAndId(userId, id interface{}) string {
	return fmt.Sprintf("Project{UserId:%v,Id:%v}", userId, id)
}

func projectsKeyByUserId(userId interface{}) string {
	return fmt.Sprintf("Projects{UserId:%v}", userId)
}

func GetProjectById(c HTTPContext, id *datastore.Key) (result *Project, err error) {
	if c.User() == nil {
		err = jsoncontext.NewError(401, "No such project found", fmt.Sprintf("No user logged in"), nil)
		return
	}
	var project Project
	var found bool
	if found, err = memcache.Memoize(c, projectKeyByUserIdAndId(c.User().Id, id), &project, func() (interface{}, error) {
		err := datastore.Get(c, id, &project)
		if err != nil {
			return nil, err
		}
		project.Id = id
		return &project, nil
	}); err == nil && found {
		result = &project
	}
	return
}

func GetProjectsByUserId(c HTTPContext) (result Projects, err error) {
	result = Projects{}
	if c.User() == nil {
		return
	}
	_, err = memcache.Memoize(c, projectsKeyByUserId(c.User().Id), &result, func() (interface{}, error) {
		ids, err := datastore.NewQuery("Project").Filter("UserId=", c.User().Id).GetAll(c, &result)
		if err = gae.FilterOkErrors(err); err != nil {
			return nil, err
		}
		for index, id := range ids {
			result[index].Id = id
		}
		sort.Sort(result)
		return result, nil
	})
	return
}
