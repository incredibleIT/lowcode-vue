import { markRaw } from "vue";
import IconCustomScript from "@/components/icons/IconCustomScript.vue"; 
import IconHttpRequest from "@/components/icons/IconHttpRequest.vue";
import IconMySQL from "@/components/icons/IconMySQL.vue";
import IconPostgreSQL from "@/components/icons/IconPostgreSQL.vue";
// 配置图标和对应的键值对应的节点类型
export const NodeTypeConfig = {
    customScript : {
        name : "自定义脚本",
        iconComponent : markRaw(IconCustomScript)
    },
    httpRequest : {
        name : "http请求",
        iconComponent : markRaw(IconHttpRequest)
    },
    mysql : {
        name : "MySQLNode",
        iconComponent : markRaw(IconMySQL)
    },
};

export const getConfig = (nodeType : string) => {
    return NodeTypeConfig[nodeType as keyof typeof NodeTypeConfig]
}