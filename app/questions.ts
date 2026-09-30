export type Question = {id:string; label:string; kind?:'text'|'number'|'single'|'multi'; options?:string[]; hint?:string; unit?:string; required?:boolean};
export const sections: {title:string; short:string; intro:string; questions:Question[]}[] = [
 {title:'先了解您的科室',short:'科室信息',intro:'以最近的实际工作情况作答即可。不确定的数据可以留空。',questions:[
 {id:'hospital',label:'医院名称',kind:'text',hint:'选填，便于后续按医院整理'},
 {id:'department',label:'您所在的科室',kind:'single',options:['PICU','NICU','综合 ICU','其他重症科室'],required:true},
 {id:'role',label:'您的岗位',kind:'single',options:['护士长','护理组长','责任护士','其他'],required:true},
 {id:'system',label:'医院是否有专门的重症监护信息系统？',kind:'single',options:['有，正在使用','有，但仅部分功能在用','没有','不清楚'],required:true},
 {id:'system_note',label:'目前主要用什么系统或方式写护理记录？',hint:'可填写系统名称、纸质记录或混合使用情况'}]},
 {title:'每小时护理记录与重复填写',short:'护理记录',intro:'请回想最近一个忙班，帮助我们理解记录工作具体花在哪里。',questions:[
 {id:'children',label:'一名护士通常负责几个患者？',kind:'number',unit:'个'},
 {id:'hour_minutes',label:'每个患者完成一次整点记录，大约需要多久？',kind:'number',unit:'分钟'},
 {id:'copy_sources',label:'哪些来源的数据需要抄写？',kind:'multi',options:['监护仪','呼吸机','微量泵／输注泵','手工测量','检验结果','其他']},
 {id:'copy_details',label:'具体要抄哪些数据，哪些还要在别处再写一次？',hint:'例如：体征、呼吸参数、泵速、输注量等'},
 {id:'transfusion',label:'输血记录单与监护单中，哪些内容重复？',hint:'请说明两张单的时间点、格式或要求是否相同；无相关场景可填“不涉及”'},
 {id:'late_record',label:'来不及当时记录时，怎么保存数据、什么时候补录？',hint:'补录时最难找回哪部分数据？'}]},
 {title:'记录被打断之后',short:'记录中断',intro:'临时治疗、检查打断记录时，哪些工作需要重新来过？',questions:[
 {id:'interrupt',label:'最近一次记录被打断，回来后最费时间的是什么？',kind:'multi',options:['找回填写位置','回忆当时数据','确认哪些已写过','重新录入丢失内容','没有明显影响','其他']},
 {id:'interrupt_case',label:'当时正在写哪部分？后来怎么继续完成？'},
 {id:'draft',label:'目前系统能否保留未完成的记录？',kind:'single',options:['可以自动保留','需要手动保存','不能保留','使用纸质记录','不清楚']},
 {id:'interrupt_loss',label:'是否遇到丢失、重复填写或漏填不易发现的情况？',hint:'如有，请举一个例子；没有可填“无”'}]},
 {title:'目标体温管理',short:'体温管理',intro:'如果科室没有相关场景，可以选择“不涉及”，其余问题留空。',questions:[
 {id:'temp_problem',label:'目标体温管理中，主要困难是什么？',kind:'multi',options:['偏离目标温度','体温波动频繁','调整后难判断效果','不同设备读数不一致','目前没有明显困难','不涉及']},
 {id:'temp_case',label:'最近一次控制困难时，具体发生了什么？',hint:'描述工作过程即可，请勿填写患儿身份信息'},
 {id:'temp_target',label:'目标温度、允许波动范围和维持时间由谁确定，在哪里查看？',hint:'要求调整后，护士从哪里获取最新信息？'},
 {id:'temp_monitor',label:'用什么设备、什么部位监测？连续监测还是间隔测量？',hint:'若多个设备读数不同，目前如何核对？'},
 {id:'temp_action',label:'偏离目标时，怎么发现、通知和记录？',hint:'最需要反复查看或核对哪些信息？'}]},
 {title:'频繁检查的时间安排',short:'检查安排',intro:'关注血气、血糖、血常规等检查如何安排和持续跟进。',questions:[
 {id:'schedule_method',label:'目前用什么排列检查时间？',kind:'multi',options:['纸条／私人笔记','白板','Excel 等额外表格','系统任务清单','口头提醒','其他']},
 {id:'schedule_owner',label:'由谁整理和更新？每个班次大约花多久？'},
 {id:'schedule_rule',label:'每 6 小时、每 2 小时等检查通常怎么安排？',kind:'single',options:['固定时点','从首次执行时间推算','两种都有','其他／不确定']},
 {id:'schedule_change',label:'临时增加、暂停或调整频次时，怎么更新安排？'},
 {id:'schedule_case',label:'最近有无差点漏做、重复做或结果迟迟未回的情况？',hint:'当时是怎么发现和处理的？没有可填“无”'},
 {id:'schedule_alert',label:'如果提供提醒，提前多久、在哪里提醒最合适？',hint:'执行后由谁确认，才能避免重复提醒？'}]},
 {title:'设备数据自动进入护理记录',short:'自动采集',intro:'请明确最想先解决的设备、数据和时间负担。',questions:[
 {id:'device_first',label:'如果只能先接入一种设备，您最希望是哪一种？',kind:'single',options:['监护仪','呼吸机','微量泵／输注泵','体温管理设备','其他','暂不需要'],required:true},
 {id:'device_fields',label:'最需要自动带入的 3–5 项数据是什么？'},
 {id:'capture_mode',label:'您更希望哪种数据呈现方式？',kind:'single',options:['随时查看连续数据','每小时带入一组，核对后保存','两种都需要','其他／尚不确定']},
 {id:'record_minutes',label:'现在每个班次写护理记录，大约用多久？',kind:'number',unit:'分钟'},
 {id:'target_minutes',label:'减少到多久，您会觉得明显值得用？',kind:'number',unit:'分钟'}]},
 {title:'微量泵使用与管理',short:'微量泵',intro:'从记录、核对、换药和报警处理中，找到最有价值的改善点。',questions:[
 {id:'pump_copy',label:'一个班次下来，哪些泵数据需要反复抄写、核对？'},
 {id:'pump_minutes',label:'这些抄写和核对合计大约花多久？',kind:'number',unit:'分钟'},
 {id:'pump_priority',label:'以下能力中，您最希望优先改善哪一项？',kind:'single',options:['集中查看各床泵状态','提前提醒换药','报警通知与处理跟进','自动记录输注过程','辅助生成护理记录','目前没有明显需求']},
 {id:'pump_value',label:'做到什么程度，您才觉得确实减轻了工作量？',hint:'可描述希望减少的时间、反复核对次数，或最近一次棘手的实际场景'}]},
 {title:'收费核对与最后补充',short:'收费管理',intro:'这一部分只了解实际工作情况，不需要提供患者或账单身份信息。',questions:[
 {id:'billing',label:'科室是否遇到漏收费或重复收费？',kind:'single',options:['遇到漏收费','遇到重复收费','两种都遇到过','未发现','不清楚'],required:true},
 {id:'billing_case',label:'如有，请举一个例子：什么项目、哪个环节、怎么发现的？',hint:'若了解，可补充核查耗时、发生频次或涉及金额；不清楚可不填'},
 {id:'priority',label:'如果未来一年只能优先改善一件事，您会选什么？',required:true,hint:'也欢迎补充前面没有覆盖的需求'},
 {id:'contact',label:'称呼及联系方式',kind:'text',hint:'选填，仅用于本次调研的后续沟通'}]}
];
export type Answers = Record<string,string|string[]>;
