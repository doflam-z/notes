# 启动docker时的参数配置



httpsqs_1218

```shell
docker run --name httpsqs_1218  -p 1218:1218 -d -v /data/docker/httpsqs/data:/data -e HTTPSQS_PARAM_T=3600 -e HTTPSQS_PARAM_A=baicai111 -e HTTPSQS_PARAM_S=120 -e HTTPSQS_PARAM_M=512 -e HTTPSQS_PARAM_X=/data toomee/httpsqs
```

httpsqs_1818

```shell
docker run --name httpsqs_1818  -p 1818:1218 -d -v /data/docker/httpsqs/1818/data:/data -e HTTPSQS_PARAM_T=3600 -e HTTPSQS_PARAM_A=baicai111 -e HTTPSQS_PARAM_S=120 -e HTTPSQS_PARAM_M=512 -e HTTPSQS_PARAM_X=/data toomee/httpsqs
```

memcache_3001

```shell
docker run --name memcache_3301 -p 3301:3301 -d memcached:1.5.16 memcached -m 128
```

memcache_11211

```shell
docker run --name memcache_3001 -p 3001:11211 -d memcached:1.5.16 memcached -m 128
```

redis_6379

```shell
docker run -itd --name redis_6379 -p 192.168.1.37:6379:6379 redis
```

mysql_3306

```shell
docker run --name mysql_3306 -d -p 192.168.1.37:3306:3306 -v /data/docker/mysql/conf:/etc/mysql/mysql.conf.d -v /mysql/data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD='jobui123' mysql:5.7
```



