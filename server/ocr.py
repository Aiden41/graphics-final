# dataset obtained from https://www.kaggle.com/datasets/dhruvildave/english-handwritten-characters-dataset/
# crop whitespace code adapted from https://gist.github.com/thomastweets/c7680e41ed88452d3c63401bb35116ed/

import pandas as pd
import numpy as np
from sklearn.base import TransformerMixin, BaseEstimator
from sklearn.pipeline import Pipeline
from sklearn.model_selection import GridSearchCV
from sklearn.svm import SVC
from sklearn.decomposition import PCA
from sklearn.metrics import f1_score
from PIL import Image, ImageOps
import pickle as pkl
import os

class GetImages( BaseEstimator, TransformerMixin ):
    def __init__( self ):
        return
    
    def fit( self, xs, ys, **params ):
        return self
    
    def transform(self, xs):
        new_xs = [] 
        for image_path in xs: # go through each path
            image = Image.open(image_path).convert("L") # open the image in grayscale format
            new_xs.append(image) # append the image object to the list
        return new_xs # return the list of images
    
class CropAndResize( BaseEstimator, TransformerMixin ):
    def __init__( self ):
        return
    
    def fit( self, xs, ys, **params ):
        return self
    
    def transform(self, xs):
        new_xs = [] 
        for image in xs: # go through each image object
            invert_im = ImageOps.invert(image) # invert the colors to make white 0 instead of 255. 
            imageBox = invert_im.getbbox() # get the boundary of whitespace 
            cropped = image.crop(imageBox) # crop the boundary out
            resized_image = cropped.resize((32,32)) # resize to 8 by 8 pixels. 
            resized_array = np.array(resized_image).flatten() # turn the resulting list of floats into a numpy array and flatten it 
            new_xs.append(resized_array) # append the transformed image to the list
        return np.array(new_xs) # return the list of transformed images as a numpy array

class OCR():
    def __init__(self):
        try:
            with open("server/ml/ocr svm.pkl", "rb") as f: # don't retrain the model if ready
                self.svm = pkl.load(f)
        except:
            self.svm = self.train_model() 

    def classify(self, obj):
        prediction = self.svm.predict(np.array([obj]))[0] # call predict on either a single image path or bytes buffer
        return prediction

    def train_model(self):
        data = pd.read_csv("server/ml/english.csv")
        xs = []
        ys =  np.array(data['label']) # get labels
        ys = [",".join(item) for item in ys.astype(str)] # turn all labels to strings so that we can...
        ys = np.char.upper(ys) # convert all to uppercase
        for image_path in data['image']: # get all image paths out of csv
            xs.append("server/ml/" + image_path)
        steps = [ ( 'open_images', GetImages() ), 
                  ( 'crop_and_resize', CropAndResize() ), 
                  ( 'svm', SVC() ) ]
        pipe = Pipeline(steps)
        grid = { 'svm__C': [2.5],
                 'svm__tol': [1e-1] }
        svm = GridSearchCV( pipe, grid, scoring='accuracy')
        print("Fitting... Please wait.")
        svm.fit(xs, ys) # fit images with labels
        pred_ys = svm.predict(xs) # get predicted values so we can see f1 score
        print("Accuracy: " + str(svm.best_score_)) # print metrics and best params
        print("F1 Score: " + str(f1_score(pred_ys, ys, average='weighted')))
        print("Best params: " + str(svm.best_params_))
        with open("server/ml/ocr svm.pkl", "wb") as f: # save the model, we are done training
            pkl.dump(svm, f)
        return svm

def main():
    ocr = OCR()
    print("Press enter only to exit.")
    while(True):
        flag = False # flag for if path was good or not
        while(flag == False):
            image_path = input("Give me a file to predict: ")
            if image_path.strip() == "": # exit case, user just pressed enter, so exit
                exit()
            try:
                prediction = ocr.classify(image_path) # call classify on given path
                flag = True
            except:
                print("Bad file path, try again.")
        print("Your character was probably \'" + str(prediction) + "\'.") # print prediction and redo loop

abspath = os.path.abspath(__file__) # moves to location of program so you don't have to run in folder
dname = os.path.dirname(abspath)
os.chdir(dname)
os.chdir("..")

if __name__ == '__main__':
    main()