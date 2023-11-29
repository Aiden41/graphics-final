from selenium import webdriver
from subprocess import Popen
from time import sleep
import os

def main():
    abspath = os.path.abspath(__file__) # moves to location of script so you don't have to run in folder
    dname = os.path.dirname(abspath)
    os.chdir(dname)
    os.chdir("..")
    p = Popen(["python", "./server/imageHandler.py"]) # open the http server
    options = webdriver.EdgeOptions()
    options.add_experimental_option("excludeSwitches" , ["enable-automation", "enable-logging"])
    options.add_argument("--guest")
    options.add_argument("start-maximized")
    browser = webdriver.Edge(options=options)
    browser.get("http://localhost:8000//main.html") # change main.html to your filename
    while(1):
        try:
            browser.current_url # tries to see current url of browser, will throw exception if browser is closed
            sleep(1) # save some resources
        except:
            break
    print("Browser closed! Closing server...")
    Popen.terminate(p) # close the http server

if __name__ == '__main__':
    main()