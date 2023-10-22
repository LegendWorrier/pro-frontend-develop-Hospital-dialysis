import { StatItem } from './../stat-item';
import { ActivatedRoute, Router } from '@angular/router';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { StatService } from '../stat.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit, AfterViewInit {
  reportList = [
    {
      title: 'Hemosheets',
      url: 'hemo-records',
    },
    {
      title: 'Dialysis Adequacy',
      url: 'dialysis-adequacy'
    }
  ];

  statList = [
    {
      title: 'Assessments',
      url: 'stat/assessments',
    },
    {
      title: 'Dialysis',
      url: 'stat/dialysis',
    },
    {
      title: 'Lab Examinations',
      url: 'stat/lab'
    }
  ];

  customStatList: StatItem[] = [];

  showBtn: boolean;

  constructor(private router: Router, private route: ActivatedRoute, private statService: StatService) { }

  ngAfterViewInit(): void {
  }

  ngOnInit() {
    this.statService.getCustomStatList().subscribe(data => this.customStatList = data);
  }

  onSelect(url) {
    this.router.navigate([url as string], { relativeTo: this.route });
  }

  onSelectCustom(item: StatItem) {
    this.router.navigate(['stat', item.name], { relativeTo: this.route, state:{
      ...item.extraParams, pageName: item.pageName, excelFileName: item.excelFileName
    } });
  }

}
