import { ImageAndFileUploadService } from './../../../share/service/image-and-file-upload.service';
import { Platform } from '@ionic/angular';
import { Unit } from './../../../masterdata/unit';
import { Component, Input, OnInit } from '@angular/core';
import { User } from 'src/app/auth/user';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss'],
})
export class UserInfoComponent implements OnInit {
  @Input() user: User;
  @Input() unitList: Unit[];

  src: string;

  get width() { return this.plt.width(); }

  constructor(private plt: Platform, private img: ImageAndFileUploadService) { }

  ngOnInit() {
    this.loadSignature();
  }

  loadSignature() {
    if (this.user.signature) {
      this.img.getImageOrFile(this.user.signature)
        .subscribe({
          next: (data) => {
            if (data) {
              const url = window.URL.createObjectURL(data);
              this.src = url;
            }
          },
          error: (err) => {
            if (err.status === 404) {
              return;
            }
            throw err;
          }
        });
    }
  }
}
