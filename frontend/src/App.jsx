import { Routes, Route } from 'react-router-dom'
import NavPrincipal from './components/compartidos/NavPrincipal.jsx'
import RutaProtegida from './auth/RutaProtegida.jsx'
import PaginaLogin from './auth/PaginaLogin.jsx'
import PanelPublico from './features/publico/PanelPublico.jsx'
import ListaTareas from './features/alumno/ListaTareas.jsx'
import FormularioEntrega from './features/alumno/FormularioEntrega.jsx'
import MisCalificaciones from './features/alumno/MisCalificaciones.jsx'
import FormularioTarea from './features/docente/FormularioTarea.jsx'
import ListaEntregas from './features/docente/ListaEntregas.jsx'
import FormularioRecurso from './features/docente/FormularioRecurso.jsx'
import FormularioAnuncio from './features/docente/FormularioAnuncio.jsx'
import TablaUsuarios from './features/admin/TablaUsuarios.jsx'
import FormularioModulo from './features/admin/FormularioModulo.jsx'
import GestionMatriculas from './features/admin/GestionMatriculas.jsx'

export default function App() {
  return (
    <>
      <NavPrincipal />
      <Routes>
        <Route path="/" element={<PanelPublico />} />
        <Route path="/login" element={<PaginaLogin />} />

        <Route
          path="/alumno/tareas"
          element={
            <RutaProtegida rolesPermitidos={['ALUMNO']}>
              <ListaTareas />
            </RutaProtegida>
          }
        />
        <Route
          path="/alumno/tareas/:tareaId/entregar"
          element={
            <RutaProtegida rolesPermitidos={['ALUMNO']}>
              <FormularioEntrega />
            </RutaProtegida>
          }
        />
        <Route
          path="/alumno/calificaciones"
          element={
            <RutaProtegida rolesPermitidos={['ALUMNO']}>
              <MisCalificaciones />
            </RutaProtegida>
          }
        />

        <Route
          path="/docente/tareas"
          element={
            <RutaProtegida rolesPermitidos={['DOCENTE']}>
              <FormularioTarea />
            </RutaProtegida>
          }
        />
        <Route
          path="/docente/tareas/:tareaId/entregas"
          element={
            <RutaProtegida rolesPermitidos={['DOCENTE']}>
              <ListaEntregas />
            </RutaProtegida>
          }
        />
        <Route
          path="/docente/recursos"
          element={
            <RutaProtegida rolesPermitidos={['DOCENTE']}>
              <FormularioRecurso />
            </RutaProtegida>
          }
        />
        <Route
          path="/docente/anuncios"
          element={
            <RutaProtegida rolesPermitidos={['DOCENTE']}>
              <FormularioAnuncio />
            </RutaProtegida>
          }
        />

        <Route
          path="/admin/usuarios"
          element={
            <RutaProtegida rolesPermitidos={['ADMINISTRADOR']}>
              <TablaUsuarios />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/modulos"
          element={
            <RutaProtegida rolesPermitidos={['ADMINISTRADOR']}>
              <FormularioModulo />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/matriculas"
          element={
            <RutaProtegida rolesPermitidos={['ADMINISTRADOR']}>
              <GestionMatriculas />
            </RutaProtegida>
          }
        />

        <Route path="*" element={<PanelPublico />} />
      </Routes>
    </>
  )
}
