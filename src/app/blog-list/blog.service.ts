import {Injectable, Inject} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';

import * as Rx from 'rxjs/Rx';
import { BlogPost, BlogPostForm} from '../blog-list/blog';
import { BlogPostLive } from '../blog-list/blog';
import * as _ from 'lodash';
import { APP_CONFIG, CONFIG, Config } from '../app.config';
import { SettingsService, CMSTypes } from '../shared/settings.service';
import { HelperService } from '../shared/services/helper.service';
import { SessionService } from '../shared/services/session.service';
import { AuthUser, AuthUserClass, BasicAuth } from '../auth/auth-user';

@Injectable()
export class BlogService {
    private _url = '/assets/blogs-json';

    constructor(
        public session: SessionService,
        @Inject(APP_CONFIG) private config: Config,
        private _http: Http,
        private settings: SettingsService,
        private helper: HelperService) {
    }
    
   /* getXCSRFToken() {
        let url = this.config.apiEndPoint + '/rest/session/token';
        
        this.http
    }*/
    
    public postBlog(blogForm: BlogPostForm) {
        if (this.settings.getCmsType() == CMSTypes.Stub)
            return;
            
        let url = 'http://10.146.201.72/Xperience/entity/node';
        let user: AuthUser = new AuthUserClass();
        user = this.session.get('authuser');
        let CSRFToken = this.session.get("X-CSRF-Token");
        let AuthString = 'Basic ' + user.token;
        let headers = new Headers({
            'Content-Type': 'application/hal+json',
            'Authorization': AuthString,
            'X-CSRF-Token': CSRFToken
        });

        let data =
            {
                "_links": {
                    "type": {
                        "href": "http://10.146.201.72/Xperience/rest/type/node/blog"
                    }
                },
                "title": [
                    {
                        "value": blogForm.title
                    }
                ],
                "body": [
                    {
                        "value": blogForm.body
                    }
                ]
            };
        let body = JSON.stringify(data);
        let options = new RequestOptions({ headers: headers });
     //   console.log(options.headers);
     //   console.log (body);
        this._http.post(url, body, options)
            .map(res => res.json())
            .subscribe(
                result => { console.log(result); },
                error => {
                    console.log(error);
                }
            )
    }
    
    createBlog() {
        let url = this.config.apiEndPoint + '/entity/node?_format=hal+json';
        
        let data = {
            "_links": {
                "type": {
                "href": this.config.apiLocal + "/rest/type/node/blog"
                }
            },
            "title": [
                {
                    "value":"Writers Square Awards Banquet2"
                }
            ],
            "body": [
                {
                    "value":"Here are some photos from our 2015 Writers Square Awards Banquet held on December 5, 2015. The student winners were awarded their scholarship checks and trophies at the banquet1."
                }
            ]
        }
        
        let body = JSON.stringify(data);
        let headers = new Headers({
            'Content-Type': 'application/hal+json',
            'Authorization': 'Basic c2VudGhpbDpzZW50aGls',
            'X-CSRF-Token': '7X35U6B5HCBs1fQSXanacgf_Yqyhpi23RcRhG-Cf3dQ' 
        });
        
        let options = new RequestOptions({ headers: headers });
        return this._http.post(url, body, options)
            .map(res => {
         //       console.log(res);
                return res.json();
            });
    }
    
    getLiveUrl() {
        return this.config.apiEndPoint + '/blogs';
    }

    transformBlogs(data) {
        let self = this;
        var tData: any[] = [];
        _.forEach(data, function(value) {
            value.tags = (value.tags == "") ? [] : value.tags.split('|');
            value.images = self.helper.parseSrcFromHtml(value.images);
            value.likes = 10;
            value.stars = 567;
            _.forEach(value.images, function(avalue, key) {
                value.images[key] = self.config.apiShort + avalue;
            })
            
            value.authoravatar = self.helper.parseSrcFromHtml(value.authoravatar);
            if (value.authoravatar.length == 0) {
                value.authoravatar = '';
            } else {
                value.authoravatar = self.config.apiShort + value.authoravatar[0];
            }
            tData.push(value);
        })
        return tData;
    }

    getBlogsFromDrupal(filter?: any): Rx.Observable<BlogPostLive[]> {
      let url = this.getLiveUrl();
      let self = this;

      return this._http.get(url)
        .map(res => res.json())
        .map(data => {
          let tData = this.transformBlogs(data);
          return tData;
        });
    }

    getBlogs(filter?: any) {
        
        if (this.settings.getCmsType() == CMSTypes.Drupal) {
            return this.getBlogsFromDrupal();
        }
        
        let url = this._url;

        if (filter && filter.username) {
            url += '/' + filter.username;
        } else {
            url += '/blogs.json';
        }
        
        return this._http.get(url)
            .map(res => res.json());
    }
    
    getTrendingBlogsFromDrupal() {
        let url = this.getLiveUrl() + '/trending';
        let self = this;
        return this._http.get(url)
            .map(res => res.json())
            .map(res => {
                var tData: any[] = [];
                _.forEach(res, function(value) {
                    let imgUrls = self.helper.parseSrcFromHtml(value.authoravatar);
                    let img: string = '';
                    if (imgUrls.length) {
                        img = self.config.apiShort + imgUrls[0];
                    }
                    
                    value.authoravatar = img;
                    tData.push(value);
                });
                
                return tData;
            });
    }
    
    getTrendingBlogs(): Rx.Observable<any[]> {
        
        if (this.settings.getCmsType() == CMSTypes.Drupal) {
            return this.getTrendingBlogsFromDrupal();
        }
        
        return this.getBlogs()
            .map(res => {
                return _.take(res, 5);
            });
    }
    
    getOlderBlogsFromDrupal() {
        let url = this.getLiveUrl() + '/older';
        let self = this;
        return this._http.get(url)
            .map(res => res.json())
            .map(res => {
                var tData: any[] = [];
                _.forEach(res, function(value) {
                    let imgUrls = self.helper.parseSrcFromHtml(value.authoravatar);
                    let img: string = '';
                    if (imgUrls.length) {
                        img = self.config.apiShort + imgUrls[0];
                    }
                    
                    value.authoravatar = img;
                    tData.push(value);
                });
       //         console.log('tdata', tData);
                return tData;
            });
    }
    
    getOlderBlogs(): Rx.Observable<any[]> {
        
        if (this.settings.getCmsType() == CMSTypes.Drupal) {
            return this.getOlderBlogsFromDrupal();
        }
        
        return this.getBlogs()
            .map(res => {
                return _.take(_.drop(res, 4), 10);
            });
    }
    
    getBlogsByUser(id) {
        let url = this.config.apiEndPoint + '/users/'+id+'/blogs';
        return this._http.get(url)
            .map(res => res.json());
    }
    
    getTOBlogs() {
        let trend = this.getTrendingBlogs();
        let older = this.getOlderBlogs();
        return Rx.Observable.forkJoin(trend, older);
    }
    
    getBlogComments(blogId): Rx.Observable<any> {
        let url = this.config.apiEndPoint + '/comments/' + blogId;
        return this._http.get(url)
            .map(res => res.json());
    }
    
    getBlogFromDrupal(id): Rx.Observable<BlogPostLive> {
        let url = 'http://10.146.201.72/Xperience/blogs';
        url += '/' + id;
        
        return this._http.get(url)
            .map(res => res.json())
            .flatMap(data => {
                let tData = this.transformBlogs(data);
                if (tData.length) {
                    return Rx.Observable.of(tData[0]);
                }
                
                return Rx.Observable.throw(new Error('No data found'));
            });
    }

    getBlog(id): Rx.Observable<BlogPostLive> {
        
        if (this.settings.getCmsType() == CMSTypes.Drupal) {
            return this.getBlogFromDrupal(id);
        }
        
        let url = this._url;
        url += '/blogs.json';
        return this._http.get(url)
            .flatMap(res => {
                let data = res.json();
                
                let index = _.findIndex(data, function(o: BlogPost) {
                    return o.id == id; 
                });
                
                if (index !== -1) {
                    return Rx.Observable.of(data[index]);
                }
                
                return Rx.Observable.throw(new Error('Blog not exists'));
            });
            
    }

    getBlogUser(id) {
        let url = this._url;

        url += '/' + id + '.json';
    //    console.log(url);
        return this._http.get(url)
            .map(res => res.json());
    }

    getBlogUsers() {
        let url = this._url;

        url += '/users.json';

        return this._http.get(url)
            .map(res => res.json());
    }
}
