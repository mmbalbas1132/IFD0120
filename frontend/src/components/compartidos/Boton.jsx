import estilos from './compartidos.module.css'

export default function Boton({ variante = 'primario', children, ...resto }) {
  const clase = variante === 'secundario' ? estilos.botonSecundario : estilos.boton
  return (
    <button className={clase} {...resto}>
      {children}
    </button>
  )
}
