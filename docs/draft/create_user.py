import pymysql

# 创建连接
conn = pymysql.connect(host='192.168.1.37', user='root', password='jobui123', database='mysql')
# 在建立连接之后,通过连接创建游标,之后对数据库的具体操作,都是通过游标进行
cursor = conn.cursor()

sid = input('id>>>')

# 写sql语句,是字符串,可以用占位符变量
# sql = "select * from user where sid < {}".format(sid)
sql = "select User from user limit 50"

# 这里需要通过游标拿到结果,结果是一个大的元组,每一条数据是其中一个元组.执行结果是受影响的行数(不是行号)
effect_row = cursor.execute(sql)

# 用fetchall和fetchone都可以获得结果,每执行一次fetchone,游标位置会向下走1
res = cursor.fetchone()

# 关闭游标和连接
cursor.close()
conn.close()

print(effect_row)
print(res)

docker run --name httpsqs_1218  -p 1218:1218 -d -v /data/docker/httpsqs/data:/data -e HTTPSQS_PARAM_T=3600 -e HTTPSQS_PARAM_A=baicai111 -e HTTPSQS_PARAM_S=120 -e HTTPSQS_PARAM_M=512 -e HTTPSQS_PARAM_X=/data toomee/httpsqs


/usr/bin/httpsqs -d -p 1218 -t 3600 -a baicai111 -s 120 -m 512 -x /web/httpsqs/data/


127.0.0.1	www.jobui.com
127.0.0.1	m.jobui.com
127.0.0.1	api.jobui.com
127.0.0.1	apis.jobui.com
127.0.0.1	xcxapi.jobui.com
127.0.0.1	js4.jobui.com
127.0.0.1	css4.jobui.com
127.0.0.1	js.jobui.com
127.0.0.1	css.jobui.com
127.0.0.1	cdnjs4.jobui.com
127.0.0.1	cdncss.jobui.com

openssl x509 -signkey star.jobui.com_key.txt -in star.jobui.com_csr.txt -extfile ssl.cnf -req -days 36500 -out *.jobui.com.crt

docker run --name redis_6379 \
-p 6379:6379 \
-d redis redis-server /etc/redis.conf