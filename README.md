# Ico Dashboard
The Ico dasshboard supports smartdashboard & shuffleboard data in a lightweight and visually appealing framework, with both automatic and manual camera connection supported.
# Getting Ico
The most recent release of the Ico dashboard can be found under releases with versions listed as yyyy.mm.dd. Download the zip or tar.gz for your operating system and run it.
# Building Ico
To build the Ico dashboard yourself clone the repository and then in your terminal run "yarn install" note if you do not have yarn you can grab it by running "npm install --global yarn". Once you have yarn run "yarn start" to start the dashboard or "yarn build" to compile it for your native platform.
# Using the Config File
Within your users/appdata/roaming (for windows) and then ico folder you will find a config.json containing your team number which can be changed from inside the dashboard, data on the dashboards last location and size, & most importantly the options to disable or enable showing smartdashboard & shuffleboard data, to hide specifc data from either, and to hide parts of the key for either to keep the dashboard clean.

An example of a config file in use is included under the name example-config.json, you may need to copy in the following to your config file if it is causing a crash for any of these not being found.
    	"splashScreen": true,
	"ShowSmartdashboardData": true,
	"SmartdashboardHideSubstrings": [],
	"ShowShuffleboardData": true,
	"ShuffleboardHideSubstrings": []

With the new NT4 protocol you must include a,
"keys": [
		["/SmartDashboard/Current Draw","NetworkTableTypeInfos.kDouble",0.5,0]
		]
array where the first value is the string you want to dsiplay, the second is the data type, the third is the update frequency, and the fourth is how many decimal places you want to round; that applies only to numbers and arrays of numbers and should otherwise be set null.