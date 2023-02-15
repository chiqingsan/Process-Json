"ui";

$ui.layout(
    <vertical >
        
        <frame gravity="center"  h="60" >
            <text size="18" color="#2c3e50" gravity="center" text="Json筛选及处理"/>
        </frame>
        
        <vertical h="auto">
            <input   id="path" hint="请输入json文件夹的路径"/>
            <vertical>
                <input w="auto" id="newname" hint="请输入json文件重命名的名字"/>
                
                <input inputType="number" w="auto" id="juli" hint="请输入json文件筛选的距离（米）"/>
            </vertical>
            <horizontal >
                <checkbox w="auto" id="jsons" text="筛选"/>
                <checkbox w="auto" id="jsonc" text="重命名"/>
                <checkbox w="auto" id="jsond" text="打乱"/>
                <checkbox w="auto" id="jsonj" text="校验"/>
            </horizontal>
            <button color="#2c3e50" marginBottom="5" id="kaishi" text="开始"/>
        </vertical>
        
        <vertical h="*" padding="20 10">
            <text marginBottom="12" color="#9e7a7a">运行日志(by:持青伞)：</text>
            <com.stardust.autojs.core.console.FileConsoleView id="console" layout_width="match_parent" layout_height="match_parent" />
            
        </vertical>
        
    </vertical>
);

console.show()


//浮点正则验证
let truef = /-?[0-9]*\.[0-9]*$/


//清空日志
console.clear()

//设置日志的颜色
$ui.console.setColor("D", "#2c3e50");


//设置点击事件

$ui.kaishi.on("click", () => {
    if ($ui.path.getText().toString() != "") {
        //执行主体函数
        mian()

    } else {
        alert("请输入json文件夹的路径")
    }
});


//主体代码
function mian() {
    //填写需要筛选的json路径
    var lujin = $ui.path.getText().toString()
    var newname = $ui.newname.getText().toString()
    var juli = $ui.juli.getText().toString()


    //筛选出json文件，并列入数组，且排除非json文件以及文件夹
    var path = files.listDir(lujin, function(name) {
        return name.endsWith(".json") && files.isFile(files.join(lujin, name));
    });

    //ui逻辑顺序

    if ($ui.jsonj.isChecked()) {
        jy()
    }
    if ($ui.jsond.isChecked()) {
        dl()
    }
    if ($ui.jsons.isChecked()) {
        sx()
    }
    if ($ui.jsonc.isChecked()) {
        cmm()
    }


    //重命名函数

    function cmm() {

        let path = files.listDir(lujin, function(name) {
            return name.endsWith(".json") && files.isFile(files.join(lujin, name));
        });
        //json重命名
        log("开始重命名")

        if (newname == "") {
            alert("请输入你要重命名的名称")

        } else {

            console.time("本次重命名一共用时：")

            for (let i = 0; i < path.length; i++) {

                let a = i + 1
                log("当前执行到：" + lujin + path[i] + "。已重命名" + a + "个")

                //处理内部文件名

                //读取json内容
                var jsontext = files.read(lujin + path[i], encoding = "utf-8")



                //分割json，提取json的name
                let jsonarr = jsontext.split(",")
                jsonarr[1] = '"name": "' + newname + (i + 1) + '"'
                //把修改过的内容合并

                jsontext = jsonarr.join(",")


                //写入文件并覆盖
                files.write(lujin + path[i], jsontext, encoding = "utf-8")


                //处理外部文件名
                files.renameWithoutExtension(lujin + path[i], newname + a)
            }

            log("重命名完成")
            console.timeEnd("本次重命名一共用时：")


        }
    }


    //校验json点

    function jy() {

        let path = files.listDir(lujin, function(name) {
            return name.endsWith(".json") && files.isFile(files.join(lujin, name));
        });
        log("开始校验")

        console.time("本次校验一共用时：")
        //遍历文件列表，寻找损坏的json文件
        for (let i = 0; i < path.length; i++) {

            log("当前检测的文件为：" + path[i])

            //join文件路径
            let jsonpath = files.join(lujin, path[i])
            //读取json内容
            let json = files.read(jsonpath, encoding = "utf-8")

            //过滤json坐标
            let jsonxy_str = json.slice(json.indexOf("[") + 1, json.length - 2)
            //将json的xyz坐标转为数组
            let jsonxy = jsonxy_str.split(",")


            //遍历寻找错误的json点，并将其移入文件夹
            for (let j = 0; j < jsonxy.length; j++) {
                if (!truef.test(jsonxy[j])) {
                    log("该json点出现损坏：" + jsonxy[j])
                    files.ensureDir(lujin + "损坏的json文件/")
                    files.move(lujin + path[i], lujin + "损坏的json文件/" + path[i])
                    //寻找到错误点后，移入文件夹并退出循环
                    break
                }

            }

        }

        log("校验完成")
        console.timeEnd("本次校验一共用时：")


    }


    //去重筛选

    function sx() {

        let path = files.listDir(lujin, function(name) {
            return name.endsWith(".json") && files.isFile(files.join(lujin, name));
        });

        log("开始去重")

        if (juli == "") {
            alert("请输入你要筛选的距离")

        } else {

            console.time("本次去重一共用时：")

            for (let i = 0; i < path.length; i++) {

                if (files.exists(lujin + path[i])) {
                    log("当前检测的文件为：" + path[i])

                    //join文件路径
                    let jsonpath = files.join(lujin, path[i])
                    //读取json内容
                    let json = files.read(jsonpath, encoding = "utf-8")

                    //过滤json坐标
                    let jsonxy_str = json.slice(json.indexOf("[") + 1, json.length - 2)
                    //将json的xyz坐标转为数组
                    let jsonxy = jsonxy_str.split(",")

                    var json_x1 = jsonxy[0]
                    var json_y1 = jsonxy[2]

                } else {
                    continue
                }



                for (let k = i + 1; k < path.length; k++) {

                    if (files.exists(files.join(lujin, path[k]))) {
                        //join文件路径
                        let jsonpath = files.join(lujin, path[k])
                        //读取json内容
                        let json = files.read(jsonpath, encoding = "utf-8")

                        //过滤json坐标
                        let jsonxy_str = json.slice(json.indexOf("[") + 1, json.length - 2)
                        //将json的xyz坐标转为数组
                        let jsonxy = jsonxy_str.split(",")

                        let json_x2 = jsonxy[0]
                        let json_y2 = jsonxy[2]


                        let json_m = Math.pow(Math.abs(json_x1 - json_x2), 2) + Math.pow(Math.abs(json_y1 - json_y2), 2)
                        // log('距离是：' + Math.sqrt(json_m))

                        if (Math.sqrt(json_m) < juli) {
                            log(path[i] + "和" + path[k] + '距离是：' + Math.sqrt(json_m))
                            
                            log("已将" + path[k] + "已入重复json点文件夹")
                            
                            files.ensureDir(lujin + "重复的json文件/")
                            
                            files.move(lujin + path[i], lujin + "重复的json文件/" + path[i])
                            break
                        }
                    } else {
                        continue
                    }

                }

            }

            log("去重完成")
            console.timeEnd("本次去重一共用时：")

        }
    }

    function dl() {

        let paht = files.listDir(lujin, function(name) {
            return name.endsWith(".json") && files.isFile(files.join(lujin, name));
        });

        log("开始打乱json")
        console.time("本次打乱一共用时：")

        for (let i = 0; i < path.length; i++) {


            log("当前文件为：" + path[i])
            let dlname = Math.round(Math.random() * 10000000000000)

            //处理内部文件名

            //读取json内容
            let jsontext = files.read(lujin + path[i], encoding = "utf-8")
            log(lujin + path[i])
            //分割json，提取json的name
            let jsonarr = jsontext.split(",")
            log(jsonarr[1])
            jsonarr[1] = '"name": "' + dlname + '"'
            log(jsonarr[1])
            //把修改过的内容合并

            jsontext = jsonarr.join(",")

            //写入文件并覆盖
            files.write(lujin + path[i], jsontext, encoding = "utf-8")

            //处理外部文件名
            files.renameWithoutExtension(lujin + path[i], dlname)
        }

        log("打乱完成")
        console.timeEnd("本次打乱一共用时：")
    }
}