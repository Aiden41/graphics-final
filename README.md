This project is a combination of our Graphics and Machine Learning final projects.
It is an interactive game where you answer questions to move past each room.

To run the program, you will need to download a dataset and train the machine learning model first.
Below are instructions on how to do so.

Create a folder called ml in the server directory. 
Download the dataset from https://www.kaggle.com/datasets/dhruvildave/english-handwritten-characters-dataset/
Extract the contents of the zip into ml.
The folder structure should look like this:

> server/
    >> ml/
        >>> Img/
        >>> english.csv

You should now be able to run ocr.py. Upon completion, ocr.py will save the model to a file called ocr svm.pkl inside of the ml folder.

To run the full program, run server.py. 
