# Hemodialysis Pro
- Use Ionic Angular

- Connect to backend created with C# ASP .net core


## building for android
1. ionic build --prod
1. ionic capacitor add android

   ***files must be manually updated here:***
1. open android project in native IDE
   1. open `MainActivity.java` and edit file:
      ``` java
      this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
        // Additional plugins you've installed go here
        // Ex: add(TotallyAwesomePlugin.class);
        add(DarkMode.class); //Add this line
      }});
      ```
   1. Open `AndroidManifest.xml` and edit file:
      ``` xml
      <activity
            android:configChanges="..."
      ```
      **remove 'uimode' from configChanges*
1. ionic capacitor build android --prod --release
