import { ChangeDetectorRef, EventEmitter, Injector } from "@angular/core";
import { OptionTypes } from "../enums/option-types.enum";
import { ToastType, presentToast } from "../utils";
import { AssessmentInfo, AssessmentItem, AssessmentOptionInfo } from "./assessment";
import { AssessmentService } from "./assessment.service";


export function initAssessmentInfo(assessmentInfoList: AssessmentInfo[], items: AssessmentItem[]): AssessmentInfo[] {
  assessmentInfoList.forEach(item => {
    if (item.hasOther) {
      if (!item.optionsList.map(x => x.id).includes(0)) {
        item.optionsList.push({
          id: 0,
          order: item.optionsList.length,
          name: 'other',
          displayName: 'Other',
          textValue: undefined,
          value: undefined
        });
      }

      const valueType = isValueType(item);
      let data = getData(items, item);
      if (!valueType && data?.text && (!data.selected?.includes(0) ?? false)) {
        data.selected!.push(0);
      }
      
      if (valueType && hasCustomValue(data, item)) {
        (data as any).custom = true;
      }
      // re
      data = getData(items, item, true);
      if (!valueType && data?.text && (!data.selected?.includes(0) ?? false)) {
        data.selected!.push(0);
      }
      if (valueType && hasCustomValue(data, item)) {
        (data as any).custom = true;
      }
    }
  });

  return assessmentInfoList;
}


export function getData(items: AssessmentItem[],  info: AssessmentInfo, reassessment?: boolean) {
  if (!items) {
    return null;
  }
  return items.find(x => x.assessmentId === info.id && x.isReassessment === (reassessment??false));
}

export function getSelectedOption(info: AssessmentInfo, data: AssessmentItem) {
  if (!data || !data.selected) {
    return null;
  }
  if (info.optionsList?.length === 0) {
    return null;
  }
  return info.optionsList.find(x => x.id === data!.selected![0]);
}

export function getLabel(data: AssessmentItem, assessment: AssessmentInfo) {
  if (!data) {
    return null;
  }

  if (data.checked) {
    const yes = assessment.optionsList.find(x => x.name === 'yesLabel');
    return yes?.displayName ?? 'Yes';
  }
  else {
    const no = assessment.optionsList.find(x => x.name === 'noLabel');
    return no?.displayName ?? 'No';
  }
}

export function getTextLabel(item: AssessmentInfo) {
  return item.optionsList.find(x => x.name === 'textLabel')?.displayName ?? 'Extra Value';
}

export function getNumberLabel(item: AssessmentInfo) {
  return item.optionsList.find(x => x.name === 'numberLabel')?.displayName ?? 'Extra Value (number)';
}

export function getOptionList(item: AssessmentInfo) {
  let list = item.optionsList.filter(x => x.name !== 'textLabel' && x.name !== 'numberLabel');
  if (isValueType(item)) {
    list = list.filter(x => x.id !== 0);
  }
  return list;
}

export function isValueType(item: AssessmentInfo) {
  return item.optionType === OptionTypes.Number || item.optionType === OptionTypes.Text;
}

export function hasCustomValue(data: AssessmentItem | null | undefined, info: AssessmentInfo) {
  return data && !info.optionsList.find(x => (x.textValue && x.textValue === data.text) || (x.value && x.value === data.value));
}

function initItem(items: AssessmentItem[], data: AssessmentItem, info: AssessmentInfo, reassessment: boolean): AssessmentItem {
  if (!data) {
    data = {
      assessmentId: info.id,
      isReassessment: reassessment,
      selected: []
    };
    items.push(data);
  }
  return data;
}

export function toggleCheck(items: AssessmentItem[], data: AssessmentItem, info: AssessmentInfo, reassessment: boolean) {
  data = initItem(items, data, info, reassessment);
  data.checked = !data.checked;
}

export function customToggle(items: AssessmentItem[], data: AssessmentItem, info: AssessmentInfo, reassessment: boolean) {
  console.log('toggle custom')
  data = initItem(items, data, info, reassessment);
  (data as any).custom = !(data as any).custom;
}

export function isCustom(data: AssessmentItem) {
  return (data as any)?.custom ?? false;
}

export function isOther(data: AssessmentItem): boolean {
  if (!data) { return false; }
  return data.selected!.includes(0);
}

export function select(items: AssessmentItem[], o: AssessmentOptionInfo | CustomEvent, data: AssessmentItem, info: AssessmentInfo, reassessment: boolean) {
  data = initItem(items, data, info, reassessment);
  if (o instanceof CustomEvent) {
    const id = o.detail.value;
    data.selected!.length = 0;
    data.selected!.push(id);
  }
  else {
    const index = data.selected!.indexOf(o.id!);
    if (index > -1) {
      data.selected!.splice(index, 1);
    }
    else {
      data.selected!.push(o.id!);
    }
  }
}

export function selectOption(items: AssessmentItem[], o: AssessmentOptionInfo | CustomEvent, data: AssessmentItem, info: AssessmentInfo, reassessment: boolean) {
  data = initItem(items, data, info, reassessment);
  if (o instanceof CustomEvent) {
    const value = o.detail.value;
    if (info.optionType === OptionTypes.Text) {
      data.text = value;
    }
    else if (info.optionType === OptionTypes.Number) {
      data.value = Number.parseFloat(value);
    }
  }
  else {
    if (info.optionType === OptionTypes.Text) {
      data.text = o.textValue;
    }
    else if (info.optionType === OptionTypes.Number) {
      data.value = o.value;
    }
  }
}

export function textInput(items: AssessmentItem[], value: CustomEvent, data: AssessmentItem, info: AssessmentInfo, reassessment: boolean) {
  data = initItem(items, data, info, reassessment);
  data.text = value.detail.value;
}

export function valueInput(items: AssessmentItem[], value: CustomEvent, data: AssessmentItem, info: AssessmentInfo, reassessment: boolean) {
  data = initItem(items, data, info, reassessment);
  data.value = Number.parseFloat(value.detail.value);
}



export function trackOption(item: AssessmentOptionInfo, index: number) {
  return item.name + index;
}

export function clearItem(data: AssessmentItem,
  dependencies: 
    {
      items: AssessmentItem[],
      itemsChange: EventEmitter<AssessmentItem[]>,
      assessmentService: AssessmentService,
      injector: Injector,
      cdr: ChangeDetectorRef
    }) {
  if (!data) {
    return;
  }

  dependencies.items.splice(dependencies.items.indexOf(data), 1);

  if (data.id) {
    dependencies.assessmentService.deleteItem(data).subscribe({
      next: () => {
        presentToast(dependencies.injector, { header: 'Cleared', message: 'The assessment item has been cleared.', native: true });

        data.checked = undefined;
        data.selected = undefined;
        data.text = undefined;
        dependencies.cdr.detectChanges();

        dependencies.itemsChange.emit(dependencies.items);
      },
      error: (err) => {
        console.log(err);
        presentToast(dependencies.injector, { type: ToastType.alert, header: 'Error', message: 'Cannot clear the assessment. Please try again.'});
        // reset
        dependencies.items.push(data);
      }
    });
  }

}