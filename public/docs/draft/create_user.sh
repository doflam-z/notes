#!/bin/bash

mysqluser="root"
mysqlpass="jobui123"
mysqlport="3306"
declare -A alluser=(["jobui_w"]="2mUWWqzEjChRfhYs" ["system_w"]="jdxVrzUcRysBZR5j" ["baicai_w"]="qemvBQJhPpACcveW")

function mysqlconn ()
{
    mysqlip=$1
    comm=$2
    mysql -u${mysqluser} -p${mysqlpass} -h${mysqlip} -P${mysqlport} -e "$comm"|sed 1d
}
 
function createdbtable () 
{
    for key in ${!alluser[*]} )
    do
		echo $key"开始"
		mysqlconn $1 "use mysql;CREATE USER {$key}@'%' IDENTIFIED BY {${alluser[$key]}};";
    done

    for key in ${!alluser[*]} )
    do
        echo $key"开始"
        mysqlconn $1 "use mysql;CREATE USER {$key}@'%' IDENTIFIED BY {${alluser[$key]}};";
        mysqlconn $1 "use mysql;CREATE USER {$key}@'%' IDENTIFIED BY {${alluser[$key]}};";
    done
}
 
createdbtable "192.168.1.37"
exit 0


CREATE USER 'jobui_w'@'%' IDENTIFIED BY '2mUWWqzEjChRfhYs';
CREATE USER 'system_w'@'%' IDENTIFIED BY 'jdxVrzUcRysBZR5j';
CREATE USER 'baicai_w'@'%' IDENTIFIED BY 'qemvBQJhPpACcveW';

GRANT ALL ON jobui_college.* TO 'jobui_w'@'%';
GRANT ALL ON system_setting.* TO 'system_w'@'%';

jobui_area jobui_college jobui_company jobui_data jobui_job jobui_mail jobui_salary jobui_site jobui_snatch_college jobui_user system_keyword system_setting