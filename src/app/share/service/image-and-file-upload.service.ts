import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, ImageOptions } from '@capacitor/camera';
import { Platform } from '@ionic/angular';
import { ServiceURL } from 'src/app/service-url';
import { Backend } from 'src/app/utils';

@Injectable({
  providedIn: 'root'
})
export class ImageAndFileUploadService {

  constructor(private plt: Platform, private http: HttpClient) { }


  async selectPicture(source?: CameraSource) {

    const options: ImageOptions = {
      quality: 100,
      source: source ? source : CameraSource.Prompt,
      // allowEditing: true,
      correctOrientation: true,
      webUseInput: source === CameraSource.Photos ? true : false,
      resultType: CameraResultType.Uri
    };

    try {
      const image = await Camera.getPhoto(options);
      const blob = await fetch(image.webPath).then(r => r.blob());
      console.log(blob);

      return { path: image.webPath, data: blob, name: image.webPath.split('/').pop() };

    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /**
   * 
   * @param accept a list of file types that are expected (separate by comma ',') e.g. ".xls,.xlsx"
   * @param limitSize limit in MB size
   * @returns 
   */
  async browseLocalFile(accept?: string, limitSize?: number) {
    var input = document.getElementById('upload-input') as HTMLInputElement;
    if (!input) {
      console.log('create new input...');
      input = document.createElement("input") as HTMLInputElement;
      input.id = 'upload-input';
      input.style.display = 'none';
      input.type = 'file';
    }
    if (accept) {
      input.accept = accept;
    }

    document.body.appendChild(input);

    return new Promise<File>((resolve, reject) => {
      input.click();
      input.onchange = async () => {
        var file = input.files[0];
        if (!file) {
          resolve(null);
        }
        if(limitSize && file.size/1024/1024 > limitSize){
          reject('Invalid file size');
        };

        resolve(file);
        document.body.removeChild(input);
      };
    });
    
  }

  getImageOrFile(id: string) {
    return this.http.get(Backend.Url + ServiceURL.upload + '/' + id, { responseType: 'blob' });
  }

  uploadImageOrFile(data: Blob, filename?: string, id?: string) {
    const form = new FormData();
    form.append(id ?? '', data, filename);
    return this.http.post<string[]>(Backend.Url + ServiceURL.upload, form);
  }
}
