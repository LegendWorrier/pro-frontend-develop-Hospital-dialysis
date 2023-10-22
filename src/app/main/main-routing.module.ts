import { PatientHistoryPageModule } from './../patients/patient-detail/patient-history/patient-history.module';
import { PrescriptionResolver } from './../patients/prescription-resolver.resolver';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DoctorListResolver } from '../patients/doctor-list-resolver';
import { MainPage } from './main.page';
import { HemosheetResolver } from '../dialysis/hemo-dialysis.service';
import { PatientResolver } from '../patients/patient.service';
import { MainTabComponent } from './main-tab/main-tab.component';
import { StockItemResolver, StockableResolver } from '../stock/stock.service';

const main: Routes = [
  {
    path: 'reports',
    data: { title: 'Reports and Stats' },
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('../reports/menu/menu.module').then( m => m.MenuPageModule)
      },
      {
        path: 'hemo-records',
        data: { title: 'Hemosheets' },
        loadChildren: () => import('../reports/hemo-report/hemo-report.module').then( m => m.HemoReportPageModule)
      },
      {
        path: 'hemo-records/:hemosheetId',
        loadChildren: () => import('../reports/reports.module').then( m => m.ReportsPageModule),
        data: { pageName: 'Hemosheet', report: 'hemosheet', reportParams: { hemoId: ':hemosheetId' } }
      },
      {
        path: 'dialysis-adequacy',
        children: [
          {
            path: '',
            data: { title: 'Hemo Dialysis Adequacy' },
            loadChildren: () => import('../reports/dialysis-adequacy/dialysis-adequacy.module').then( m => m.DialysisAdequacyPageModule)
          },
          {
            path: ':patientId/:month',
            loadChildren: () => import('../reports/reports.module').then( m => m.ReportsPageModule),
            data: { pageName: 'Dialysis Adequacy', report: 'hemorecords', reportParams: { patientId: ':patientId', month: ':month' } }
          }
        ]
      },
      {
        path: 'stat',
        data: { title: 'Stats' },
        children: [
          {
            path: 'assessments',
            data: {
              pageName: 'Assessment Stats',
              stat: 'assessment',
              params: {
                infoName: 'Assessment',
                infoKey: 'displayName',
                name: 'Option',
                excelFileName: 'assessment_stat'
              }
            },
            children: [
              {
                path: '',
                loadChildren: () => import('../reports/stat/stat.module').then( m => m.StatPageModule),
                
              },
              {
                path: ':patientId',
                loadChildren: () => import('../reports/stat/stat.module').then( m => m.StatPageModule)
              }
            ]
          },
          {
            path: 'dialysis',
            data: {
              pageName: 'Dialysis Stats',
              stat: 'dialysis',
              params: {
                excelFileName: 'dialysis_stat',
                mix: true,
                hideInfo: true
              }
            },
            children: [
              {
                path: '',
                loadChildren: () => import('../reports/stat/stat.module').then( m => m.StatPageModule)
              },
              {
                path: ':patientId',
                loadChildren: () => import('../reports/stat/stat.module').then( m => m.StatPageModule)
              }
            ]
          },
          {
            path: 'lab',
            data: {
              pageName: 'Lab Exam Stats',
              stat: 'lab',
              params: {
                name: 'Lab Item',
                excelFileName: 'lab_stat',
                avg: true,
                hideInfo: true
              }
            },
            children: [
              {
                path: '',
                loadChildren: () => import('../reports/stat/stat.module').then( m => m.StatPageModule)
              }
            ]
          },
          {
            path: ':statName',
            data: {
              stat: ':statName',
              custom: true
            },
            children: [
              {
                path: '',
                loadChildren: () => import('../reports/stat/stat.module').then( m => m.StatPageModule)
              },
              {
                path: ':patientId',
                loadChildren: () => import('../reports/stat/stat.module').then( m => m.StatPageModule)
              }
            ]
          }
        ]
      }
    ]

  },
  {
    path: 'stocks',
    data: { title: 'Stocks' },
    children: [
      {
        path: '',
        loadChildren: () => import('../stock/stock.module').then( m => m.StockPageModule)
      },
      {
        path: ':unitId/add',
        loadChildren: () => import('../stock/stock-item/stock-item.module').then( m => m.StockItemPageModule)
      },
      {
        path: ':unitId/add/lot',
        loadChildren: () => import('../stock/stock-lot/stock-lot.module').then( m => m.StockLotPageModule)
      },
      {
        path: ':stockId',
        loadChildren: () => import('../stock/stock-item/stock-item.module').then( m => m.StockItemPageModule),
        resolve: {
          stockItem: StockItemResolver
        }
      }, 
      {
        path: 'detail/:itemType/:itemId',
        loadChildren: () => import('../stock/stock-detail/stock-detail.module').then( m => m.StockDetailPageModule),
        resolve: {
          itemInfo: StockableResolver
        }
      }
    ]
  },
  {
    path: '',
    component: MainPage,
    loadChildren: () => import('./main-tab/main-tab.module').then(m => m.MainTabModule)
  }
]

const routes: Routes = [
  {
    path: '',
    component: MainTabComponent,
    children: [
      {
        path: 'patients',
        data: { title: 'Patients' },
        children: [
          {
            path: '',
            loadChildren: () => import('../patients/patients.module').then(m => m.PatientsPageModule)
          },
          {
            path: 'add',
            data: { title: 'New Patient' },
            loadChildren: () => import('../patients/edit-patient/edit-patient.module').then( m => m.EditPatientPageModule)
          },
          {
            path: ':id',
            resolve: {
              patient: PatientResolver
            },
            children: [
              {
                path: '',
                loadChildren: () => import('../patients/patient-detail/patient-detail.module').then( m => m.PatientDetailPageModule),
                resolve: {
                  doctorList: DoctorListResolver
                }
              },
              {
                path: 'update',
                loadChildren: () => import('../patients/edit-patient/edit-patient.module').then( m => m.EditPatientPageModule)
              },
              {
                path: 'history',
                loadChildren: () => import('../patients/patient-detail/patient-history/patient-history.module').then( m => m.PatientHistoryPageModule)
              },
              {
                path: 'prescriptions',
                children: [
                  {
                    path: 'add',
                    loadChildren: () => import('../dialysis/dialysis-prescription-edit/dialysis-prescription-edit.module')
                    .then( m => m.DialysisPrescriptionEditPageModule)
                  },
                  {
                    path: ':prescriptionId',
                    resolve: {
                      prescription: PrescriptionResolver
                    },
                    loadChildren: () => import('../dialysis/dialysis-prescription-edit/dialysis-prescription-edit.module')
                    .then( m => m.DialysisPrescriptionEditPageModule)
                  },
                ]
              },
              {
                path: 'hemosheets',
                children: [
                  {
                    path: ':hemosheetId',
                    loadChildren: () => import('../dialysis/hemosheet-edit/hemosheet-edit.module').then( m => m.HemosheetEditPageModule),
                    resolve: {
                      hemosheet: HemosheetResolver,
                      patient: PatientResolver,
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        path: 'schedule',
        data: { title: 'Schedule' },
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadChildren: () => import('../schedule/schedule.module').then(m => m.SchedulePageModule)
          },
          {
            path: 'setting/:unitId',
            loadChildren: () => import('../schedule/schedule-config/schedule-config.module').then( m => m.ScheduleSettingPageModule)
          }
        ]
      },
      {
        path: 'shifts',
        data: { title: 'Shifts' },
        loadChildren: () => import('../shifts/shifts.module').then(m => m.ShiftsPageModule)
      },
      {
        path: 'lab-exam',
        data: { title: 'Lab Exam' },
        children: [
          {
            path: '',
            loadChildren: () => import('../lab-exam/lab-exam.module').then( m => m.LabExamPageModule)
          },
          {
            path: ':id',
            resolve: {
              patient: PatientResolver
            },
            loadChildren: () => import('../lab-exam/lab-patient/lab-patient.module').then( m => m.LabPatientPageModule)
          }
        ]
      },
      {
        path: 'monitor',
        data: { title: 'Monitor' },
        loadChildren: () => import('../monitor/monitor.module').then( m => m.MonitorPageModule)
      },
      {
        path: '',
        redirectTo: '/patients',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(main)],
  exports: [RouterModule]
})
export class MainPageRoutingModule {}

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainTabRoutingModule {}
