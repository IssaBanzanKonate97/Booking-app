
const FormInput = (
    { name, label, value, onChange, error, type, placeholder, errorMessage },
) => {
    return <div className="w-full mb-2.5">
        <label htmlFor={name} className="text-sm text-slate-600 pl-2 block font-normal">
            {label}
        </label>
        <input
            placeholder={placeholder}
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            className={`${error && 'border-rose-500'} w-full border border-slate-300 rounded-md shadow my-1 block py-2.5 px-4 text-slate-600 focus:outline-none focus:border-portal-400`}
        />
        {
            error && <span className="text-rose-500 text-xs font-normal block mx-2">{errorMessage}</span>
        }
    </div>
};

export default FormInput;