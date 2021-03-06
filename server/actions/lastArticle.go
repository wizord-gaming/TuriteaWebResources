package actions

import (
	"log"
	"net/http"
	"strconv"

	"TuriteaWebResources/server/base"
	"TuriteaWebResources/server/buffer"
	"TuriteaWebResources/server/dataLevel"
)

func lastArticle(w http.ResponseWriter, r *http.Request) {
	log.Println("call last article")
	vs := r.URL.Query()
	begin := vs.Get("begin")
	num := vs.Get("num")
	if len(begin) | len(num) == 0 {
		arts := dataLevel.SQLWorker.SelectTopArticles(10)
		articles := make([]*base.Article, len(arts))
		for i, v := range arts {
			b, ok := buffer.MainCache.Load(base.ArticleKey(v))
			if !ok {
				w.WriteHeader(400)
				return
			}
			articles[i] = b.(*base.Article)
		}
		err := base.ArticlesToJson(articles, w)
		if err != nil {
			w.WriteHeader(500)
			return
		}
	} else if (len(begin) != 0 && len(num) == 0) || (len(begin) == 0 && len(num) != 0) {
		//fmt.Println("error arg")
		w.WriteHeader(400)
		return
	} else {
		b, err := strconv.ParseInt(begin, 16, 64)
		if err != nil {
			w.WriteHeader(400)
			return
		}
		n, err := strconv.ParseInt(num, 16, 64)
		if err != nil {
			w.WriteHeader(400)
			return
		}
		arts := dataLevel.SQLWorker.SelectNextTopArticles(b, uint8(n))
		articles := make([]*base.Article, len(arts))
		for i, v := range arts {
			b, ok := buffer.MainCache.Load(base.ArticleKey(v))
			if !ok {
				//todo maybe it will be add one for error
				articles[i] = nil
				continue
			}
			articles[i] = b.(*base.Article)
		}
		err = base.ArticlesToJson(articles, w)
		if err != nil {
			w.WriteHeader(500)
			return
		}
	}
}
