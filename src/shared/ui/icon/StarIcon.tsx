type StarIconProps = {
    filled: boolean;
    size?: number;
};

export function StarIcon({ filled, size = 20 }: StarIconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={filled ? 'text-yellow-400' : 'text-gray-400'}
            fill={filled ? 'yellow' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M12 17.3l-6.18 3.7 1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.63 7.19.61-5.46 4.73L18.18 21z" />
        </svg>
    );
}