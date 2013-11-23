package model

import (
	"appengine/datastore"
	"bytes"
	"fmt"
	"github.com/soundtrackyourbrand/utils/gae"
	"github.com/soundtrackyourbrand/utils/gae/memcache"
	"sort"
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
	Id     *datastore.Key `json:"id" datastore:"-"`
	UserId int            `json:"user_id"`
	Name   string         `json:"name"`
}

func GetProjectsByUserId(c HTTPContext) (result Projects, err error) {
	result = Projects{}
	if c.User() == nil {
		return
	}
	_, err = memcache.Memoize(c, fmt.Sprintf("Projects{UserId:%v}", c.User().Id), &result, func() (interface{}, error) {
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
