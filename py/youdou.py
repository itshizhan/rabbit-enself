#!flask/bin/python
from flask import Flask, jsonify,abort

# 导入selenium的浏览器驱动接口
from selenium import webdriver

# 要想调用键盘按键操作需要引入keys包
from selenium.webdriver.common.keys import Keys

# 导入chrome选项
from selenium.webdriver.chrome.options import Options

import re
import time
import base64
import requests
import json
import collections

app = Flask(__name__)
# 创建chrome浏览器驱动，无头模式（超爽）
chrome_options = Options()
#chrome_options.add_argument('--headless')
driver = webdriver.Chrome(chrome_options=chrome_options)
tasks = [
    {
        'id': 1,
        'title': u'Buy groceries',
        'description': u'Milk, Cheese, Pizza, Fruit, Tylenol', 
        'done': False
    },
    {
        'id': 2,
        'title': u'Learn Python',
        'description': u'Need to find a good Python tutorial on the web', 
        'done': False
    }
]

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,session_id')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,HEAD')
    # 这里不能使用add方法，否则会出现 The 'Access-Control-Allow-Origin' header contains multiple values 的问题
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@app.route('/todo/api/v1.0/tasks', methods=['GET'])
def get_tasks():
    return jsonify({'tasks': tasks})

@app.route('/todo/api/v1.0/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    task =list(filter(lambda t: t['id'] == task_id, tasks))
    if len(task) == 0:
        abort(404)
    #http://www.iciba.com/structure
    return jsonify({'task': tasks[0]})

@app.route('/todo/api/v1.0/dict/<string:word>', methods=['GET'])
def get_word(word):    
    #http://www.iciba.com/structure    
    driver.get("http://www.youdao.com/w/eng/" + word + "/#keyfrom=dict2.index")
    time.sleep(0.5)
    # xpath = "//*[@id="phrsListTab"]/div[2]"    //*[@id="phrsListTab"]/div/ul
    xpath='//*[@id="phrsListTab"]/div[@class="trans-container"]/ul'
    td = driver.find_element_by_xpath(xpath)    
    #取音标
    # xpath="//*[@id="phrsListTab"]/h2/div/span[1]/span"
    #import re
    #patTest = "['fæsɪneɪtə(r)]"
    #patArr = patcompi.findall(patTest)
    #pat = r"\[(\w*)\]"
    xpath='//*[@id="phrsListTab"]/h2/div/span[1]/span'
    proun=""
    mean = td.text
    tmpMean = ""
    try:
        xb = driver.find_element_by_xpath(xpath)
    except:
        print("无音标标记")
        tmpMean = mean
        mean = ""
    else:
        pat = r"\[([\w',\(\)]*)\]"
        patcompi = re.compile(pat)
        patArr = patcompi.findall(xb.text)
        proun = xb.text
        if len(patArr)>0:
            proun = patArr[0]
    #取读音
    # xpath="/html/body/div[4]/div[6]/div[2]/div[1]/div/div/div[1]/div/div[1]/span[1]/i"
    # xpath="/html/body/div[4]/div[6]/div[2]/div[1]/div/div/div[1]/div"
    # mp = driver.find_element_by_xpath(xpath)
    #ms-on-mouseover="sound('http://res.iciba.com/resource/amp3/oxford/0/b6/fa/b6faa59bdda9a5388596c312cb6d33a6.mp3')
    #mp3 = mp.get_attribute("ms-on-mouseover")    
    #http://res.iciba.com/resource/amp3       
    #部分单词解释以“释义”开头
    #print(td.text[0:2])
    if len(td.text)>0 and td.text[0:2]=="释义":
        mean = ""
        tmpMean = td.text[2:-1]
        print(tmpMean)

    return '{"word":"%s","meaning":"%s","pronunciation":"%s","mp3":"%s","tmp":"%s"}'%(word,mean,proun,"",tmpMean)

if __name__ == '__main__':
    app.run(debug=True)