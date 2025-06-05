const PrimaryButton = ({
    children,
    action,
    disabled,
    add, // Pour ajouter un style au bouton
    isInForm,
    title,
}) => {
    const style = `${add && `${add} `}
    bg-gradient-to-r from-portal-400 to-fusion-500 hover:shadow-xl hover:shadow-fusion-400/40 hover:scale-105
    disabled:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:animate-no disabled:hover:shadow-none
    text-white text-base shadow-sm rounded-md px-8 py-2.5 font-bold m-1 mx-0.5 duration-150 roboto max-w-max cursor-pointer`;
    return isInForm ?
        <input type="submit" className={style} value={children} disabled={disabled} title={title} />
        :
        <button onClick={action} disabled={disabled} className={style} title={title}> {children} </button>
};

export { PrimaryButton };