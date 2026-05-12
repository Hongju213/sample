import { http } from './http';
import { ApiResponse } from '../common/types';

export type Employee = {
  id: number;
  name: string;
  position: string;
  department: string;
  status: 'active' | 'leave' | 'inactive';
  joinDate: string;
  project: string;
  email: string;
};

// Mock data per department key
const MOCK_DATA: Record<string, Employee[]> = {
  root: [
    { id: 1, name: '김철수', position: '수석개발자', department: '프론트엔드팀', status: 'active', joinDate: '2020-03-15', project: '포털 리뉴얼', email: 'kim.cs@company.com' },
    { id: 2, name: '이영희', position: '백엔드개발자', department: '백엔드팀', status: 'active', joinDate: '2019-07-01', project: 'API 고도화', email: 'lee.yh@company.com' },
    { id: 3, name: '박민준', position: '팀장', department: 'DevOps팀', status: 'active', joinDate: '2018-01-10', project: '클라우드 전환', email: 'park.mj@company.com' },
    { id: 4, name: '최지우', position: '기획자', department: '제품기획팀', status: 'leave', joinDate: '2021-05-20', project: 'UX 개선', email: 'choi.jw@company.com' },
    { id: 5, name: '정수아', position: '디자이너', department: 'UX팀', status: 'active', joinDate: '2022-02-14', project: '디자인 시스템', email: 'jung.sa@company.com' },
    { id: 6, name: '강동원', position: '인사담당자', department: '인사팀', status: 'active', joinDate: '2020-09-01', project: '채용 자동화', email: 'kang.dw@company.com' },
    { id: 7, name: '윤서연', position: '재무담당자', department: '재무팀', status: 'inactive', joinDate: '2017-11-15', project: '결산 시스템', email: 'yoon.sy@company.com' },
  ],
  dev: [
    { id: 1, name: '김철수', position: '수석개발자', department: '프론트엔드팀', status: 'active', joinDate: '2020-03-15', project: '포털 리뉴얼', email: 'kim.cs@company.com' },
    { id: 2, name: '이영희', position: '백엔드개발자', department: '백엔드팀', status: 'active', joinDate: '2019-07-01', project: 'API 고도화', email: 'lee.yh@company.com' },
    { id: 3, name: '박민준', position: '팀장', department: 'DevOps팀', status: 'active', joinDate: '2018-01-10', project: '클라우드 전환', email: 'park.mj@company.com' },
    { id: 8, name: '송다희', position: '개발자', department: '프론트엔드팀', status: 'active', joinDate: '2023-01-05', project: '포털 리뉴얼', email: 'song.dh@company.com' },
    { id: 9, name: '임도현', position: '개발자', department: '백엔드팀', status: 'active', joinDate: '2022-06-20', project: 'API 고도화', email: 'lim.dh@company.com' },
  ],
  frontend: [
    { id: 1, name: '김철수', position: '수석개발자', department: '프론트엔드팀', status: 'active', joinDate: '2020-03-15', project: '포털 리뉴얼', email: 'kim.cs@company.com' },
    { id: 8, name: '송다희', position: '개발자', department: '프론트엔드팀', status: 'active', joinDate: '2023-01-05', project: '포털 리뉴얼', email: 'song.dh@company.com' },
    { id: 10, name: '한지민', position: '주임개발자', department: '프론트엔드팀', status: 'leave', joinDate: '2021-08-16', project: '모바일 앱', email: 'han.jm@company.com' },
  ],
  backend: [
    { id: 2, name: '이영희', position: '백엔드개발자', department: '백엔드팀', status: 'active', joinDate: '2019-07-01', project: 'API 고도화', email: 'lee.yh@company.com' },
    { id: 9, name: '임도현', position: '개발자', department: '백엔드팀', status: 'active', joinDate: '2022-06-20', project: 'API 고도화', email: 'lim.dh@company.com' },
    { id: 11, name: '오세훈', position: '선임개발자', department: '백엔드팀', status: 'inactive', joinDate: '2016-04-11', project: '레거시 마이그레이션', email: 'oh.sh@company.com' },
  ],
  devops: [
    { id: 3, name: '박민준', position: '팀장', department: 'DevOps팀', status: 'active', joinDate: '2018-01-10', project: '클라우드 전환', email: 'park.mj@company.com' },
    { id: 12, name: '권나은', position: '엔지니어', department: 'DevOps팀', status: 'active', joinDate: '2024-02-01', project: 'CI/CD 구축', email: 'kwon.ne@company.com' },
  ],
  plan: [
    { id: 4, name: '최지우', position: '기획자', department: '제품기획팀', status: 'leave', joinDate: '2021-05-20', project: 'UX 개선', email: 'choi.jw@company.com' },
    { id: 5, name: '정수아', position: '디자이너', department: 'UX팀', status: 'active', joinDate: '2022-02-14', project: '디자인 시스템', email: 'jung.sa@company.com' },
    { id: 13, name: '배성호', position: '기획팀장', department: '제품기획팀', status: 'active', joinDate: '2017-09-25', project: 'B2B 플랫폼', email: 'bae.sh@company.com' },
  ],
  product: [
    { id: 4, name: '최지우', position: '기획자', department: '제품기획팀', status: 'leave', joinDate: '2021-05-20', project: 'UX 개선', email: 'choi.jw@company.com' },
    { id: 13, name: '배성호', position: '기획팀장', department: '제품기획팀', status: 'active', joinDate: '2017-09-25', project: 'B2B 플랫폼', email: 'bae.sh@company.com' },
    { id: 14, name: '류지혜', position: '주임기획자', department: '제품기획팀', status: 'active', joinDate: '2023-03-06', project: 'UX 개선', email: 'ryu.jh@company.com' },
  ],
  ux: [
    { id: 5, name: '정수아', position: '디자이너', department: 'UX팀', status: 'active', joinDate: '2022-02-14', project: '디자인 시스템', email: 'jung.sa@company.com' },
    { id: 15, name: '신예진', position: '수석디자이너', department: 'UX팀', status: 'active', joinDate: '2019-11-18', project: '디자인 시스템', email: 'shin.yj@company.com' },
  ],
  mgmt: [
    { id: 6, name: '강동원', position: '인사담당자', department: '인사팀', status: 'active', joinDate: '2020-09-01', project: '채용 자동화', email: 'kang.dw@company.com' },
    { id: 7, name: '윤서연', position: '재무담당자', department: '재무팀', status: 'inactive', joinDate: '2017-11-15', project: '결산 시스템', email: 'yoon.sy@company.com' },
    { id: 16, name: '문상철', position: '경영지원본부장', department: '경영지원본부', status: 'active', joinDate: '2015-06-22', project: '경영혁신', email: 'moon.sc@company.com' },
  ],
  hr: [
    { id: 6, name: '강동원', position: '인사담당자', department: '인사팀', status: 'active', joinDate: '2020-09-01', project: '채용 자동화', email: 'kang.dw@company.com' },
    { id: 17, name: '서지훈', position: '인사팀장', department: '인사팀', status: 'active', joinDate: '2018-03-12', project: '성과관리 시스템', email: 'seo.jh@company.com' },
  ],
  finance: [
    { id: 7, name: '윤서연', position: '재무담당자', department: '재무팀', status: 'inactive', joinDate: '2017-11-15', project: '결산 시스템', email: 'yoon.sy@company.com' },
    { id: 18, name: '조현우', position: '재무팀장', department: '재무팀', status: 'active', joinDate: '2016-08-29', project: '예산 시스템', email: 'cho.hw@company.com' },
    { id: 19, name: '장미래', position: '재무담당자', department: '재무팀', status: 'active', joinDate: '2024-07-15', project: '결산 시스템', email: 'jang.mr@company.com' },
  ]
};

// Simulate an API call with network delay
export async function fetchDepartmentEmployees(deptKey: string): Promise<Employee[]> {
  try {
    // In production: const { data } = await http.get<ApiResponse<Employee[]>>(`/api/departments/${deptKey}/employees`);
    // return data.data;
    await new Promise(resolve => setTimeout(resolve, 400)); // simulate network latency
    return MOCK_DATA[deptKey] ?? [];
  } catch {
    return MOCK_DATA[deptKey] ?? [];
  }
}
