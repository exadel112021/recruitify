import { ProfilePageComponent } from './shared/pages/profile-page/profile-page.component';
import { paths } from './app-routing.constants';
import { CandidatesPageComponent } from './shared/pages/candidates-page/candidates-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './core/main-layout/main-layout.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { ProjectsPageComponent } from './shared/pages/projects-page/projects-page.component';

const mainRouter: Routes = [
  { path: paths.login, component: LoginPageComponent },
  { path: paths.projects, component: ProjectsPageComponent },
  { path: paths.candidates, component: CandidatesPageComponent },
  { path: paths.profile, component: ProfilePageComponent },
  { path: 'profile/:id', component: ProfilePageComponent }
];

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: mainRouter,
  },
  {
    path: paths.shared,
    loadChildren: () =>
      import('./shared/shared.module').then((m) => m.SharedModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
