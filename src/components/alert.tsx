interface AlertProps {
  children: React.ReactNode
  error: boolean
}

const Alert = ({ children, error }: AlertProps) => {
  return (
    <div
      role="alert"
      className={`border px-4 py-3 rounded relative mb-4 ${error ? "border-red-400 bg-red-100 text-red-700" : "border-blue-400 bg-blue-100 text-blue-700"}`}>
      <strong className="font-bold">{error ? "Error:" : "Info:"}</strong>
      <span className="block sm:inline">{children}</span>
    </div>
  )
}

export default Alert
