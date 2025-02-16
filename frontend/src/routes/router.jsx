import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import Home from "../pages/Home/Home";
import Abbonamenti from "../pages/Pagamento/Pagamento";
import GymRegistration from '../pages/GymRegistration/GymRegistration';
import PtRegistration from "../pages/PtRegistration/PtRegistration";
import UserRegistration from '../pages/UserRegistration/UserRegistration'; 
import LoginPalestra from '../pages/LoginPalestra/LoginPalestra';
import DashboardPalestra from '../pages/DashboardPalestra/DashboardPalestra';
import LoginPersonalTrainer from "../pages/LoginPersonalTrainer/LoginPersonalTrainer";
import DashboardPersonalTrainer from "../pages/DashboardPersonalTrainer/DashboardPersonalTrainer";
import LoginUtente from "../pages/LoginUtente/LoginUtente";
import DashboardUtente from "../pages/DashboardUtente/DashboardUtente";
import Pagamento from "../pages/Pagamento/Pagamento";
import PagamentoSuccesso from "../pages/Pagamento/PagamentoSuccesso/PagamentoSuccesso";
import PagamentoAnnullato from "../pages/Pagamento/PagamentoAnnullato/PagamentoAnnullato";
import SelezionaTrainer from "../pages/DashboardUtente/SelezionaTrainer/SelezionaTrainer";
import GestioneSchede from "../pages/DashboardPersonalTrainer/GestioneSchede/GestioneSchede";
import ModificaProfiloTrainer from "../pages/DashboardPersonalTrainer/ModificaProfiloTrainer/ModificaProfiloTrainer";
import ModificaProfiloPalestra from "../pages/DashboardPalestra/ModificaProfiloPalestra/ModificaProfiloPalestra";
import PersonalTrainers from "../components/headers/PersonalTrainer";
import PianoAbbonamento from "../components/PianoAbbonamento";
import Termini from "../pages/Termini";
import Privacy from "../pages/Privacy";


 // Assicurati che il percorso sia corretto
 export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout/>,
        children: [
            {
                path: "/",
                element: <Home/>
            },
           
            {
                path: "registrazione-personal-trainer",
                element: <PtRegistration />
              },
            {
                path: "registrazione-utente",
                element: <UserRegistration /> 
            },
            {
                path: "abbonamenti",
                element: <Abbonamenti/>
            },
            {
                path: '/registrazione-palestra',
                element: <GymRegistration />,
            },
            {
                path: '/login-palestra',
                element: <LoginPalestra />
            },
            {
                path: '/dashboard-palestra',
                element: <DashboardPalestra />
            },
            {
                path: "/dashboard-personal-trainer/:id",
                element: <DashboardPersonalTrainer />
              },
            {
                path: "/login-trainer",
                element: <LoginPersonalTrainer/>
            },
            {
                path: "/login-utente",
                element: <LoginUtente/>
            },
            {
                path: "/dashboard-utente/:id",
                element: <DashboardUtente/>
            },
            {
                path: "/pagamento",
                element: <Pagamento/>
            },
            {
                path: "/success",
                element: <PagamentoSuccesso />
            },
            {
                path: "/cancellato",
                element: <PagamentoAnnullato/>
            },
            {
                path: "/seleziona-trainer",
                element: <SelezionaTrainer/>
            },
            {
                path: "dashboard-personal-trainer/:id/manage-workouts",
                element: <GestioneSchede/>
            },
            {
                path: "dashboard-personal-trainer/:id/edit-profile",
                element: <ModificaProfiloTrainer/>
            },
            {
                path: "modifica-profilo-palestra",
                element: <ModificaProfiloPalestra/>
            },
            {
                path: "personaltrainer",
                element: <PersonalTrainers/>
            },
            {
                path: "piano-abbonamenti",
                element: <PianoAbbonamento/>
            },
            {
                path: "terms",
                element: <Termini/>
            },
            {
                path: "privacy",
                element: <Privacy/>
            }
            
        ]
    },
 ]);
